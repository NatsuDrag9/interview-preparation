## Internet Working

Computer does not have direct access to the internet. Instead, it accesses the local network via an ethernet or a wi-fi connection. This local network is organized by **router**, which connects your local computer to your **Internet Service Provider**. The ISP then connects to other higher-level ISPs. Thus, the message originated at your local computer traverses through these different networks until it reaches its final destination.

<!-- To Do: Add a mermaid diagram representing this -->

### Domain Name Server

A decentralized internet address naming system that allows to create human readable alphabetical names (domain names) corresponding to the numeric IP addresses used by the computers.

### TCP/IP

A layered model describing how data flows through different networking layers. Each layer has a specific responsibility and communicates with layers above/below it.

**Application Layer** - Where users interact with the network

- Protocols: HTTP, HTTPS, SMTP, DNS, FTP, SSH
- Purpose: User applications send/receive data in human-readable format
- Example: Browser fetches a webpage using HTTP

**Transport Layer** - Manages reliable data delivery between applications (computers)

- Protocols: TCP (reliable, ordered), UDP (fast, unreliable)
- Purpose: Ensures data reaches the correct application port, handles flow control
- TCP example: Email delivery (must arrive, order matters)
- UDP example: Video streaming (speed > accuracy)

**Internet Layer** - Routes data across networks globally

- Protocols: IP (IPv4, IPv6), ICMP
- Purpose: Finds the best path to destination using IP addresses
- Example: Router forwards packet to another network via IP addressing

**Link Layer** - Physical transmission of data

- Protocols: Ethernet, WiFi, PPP
- Purpose: Transmits bits over physical medium (cables, radio waves)
- Example: WiFi card sends data over wireless connection

```mmd

Browser (Application)
    ↓ sends HTTP request
HTTP (Application Layer)
    ↓ uses TCP for delivery
TCP (Transport Layer) — ensures reliable delivery
    ↓ uses IP for routing
IP (Internet Layer)
    ↓ uses WiFi/Ethernet for physical transmission
WiFi/Ethernet (Link Layer)

```

---

### Credits

- [yurace](https://github.com/cheatsnake/backend-cheats?#how-the-internet-works)

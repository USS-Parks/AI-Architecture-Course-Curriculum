# Week 0 Diagnostic: What Happens After a Browser Sends an HTTP Request?

Completed: 2026-07-18

1. The browser parses the URL into a scheme, host, port, path, and query.
2. It checks browser policy and may reuse cached DNS information or an existing connection.
3. If necessary, the operating system and a DNS resolver translate the host name into an IP address.
4. The operating system chooses a route and establishes a transport connection. HTTP/1.1 and HTTP/2 commonly use TCP; HTTP/3 uses QUIC over UDP.
5. For HTTPS, the browser and server perform a TLS handshake. The browser validates the server certificate and negotiates encryption keys.
6. The browser serializes the HTTP method, target, headers, cookies or authorization material, and optional body, then sends the bytes through the socket.
7. Network interfaces and intermediate devices carry packets to the server. Packets can be delayed, retransmitted, filtered, or rejected along the way.
8. The server's operating system delivers the traffic to the listening process. A web server or application framework parses the HTTP request and applies routing, size limits, authentication, authorization, and input validation.
9. Application code performs the requested work, which may call other services, read data, or enqueue a job.
10. The server constructs an HTTP response with a status code, headers, and optional body. The response travels back over the connection.
11. The browser interprets caching and security headers, decodes or decompresses the body, and hands the result to the relevant browser subsystem or JavaScript callback.
12. The page may update, execute additional scripts, or issue more requests. Logs and telemetry on the browser, network, and server provide evidence when a boundary fails.

Failure diagnosis should identify the boundary: name resolution, routing, transport, TLS, HTTP parsing, authentication, authorization, application logic, dependency, response handling, or rendering.

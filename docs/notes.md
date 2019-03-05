### robokit notes

#### ssl cert
- https://www.perturb.org/display/754_Apache_self_signed_certificate_HOWTO.html
- https://stackoverflow.com/questions/5312311/secure-websockets-with-self-signed-certificate
- https://bugs.webkit.org/show_bug.cgi?id=158345
- https://bugs.webkit.org/show_bug.cgi?id=158345


Self-signed:
```
// ca
openssl genrsa -des3 -out ca.key 4096
openssl req -new -x509 -days 365 -key ca.key -out ca.crt

// server cert signing request
openssl req -new -key server.key -out server.csr

// server cert
openssl genrsa -out server.key 4096
openssl x509 -req -sha256 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt

// client cert
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt

// p12 for import
 openssl pkcs12 -export -clcerts -inkey client.key -in client.crt -out myClientCert.p12
 ```
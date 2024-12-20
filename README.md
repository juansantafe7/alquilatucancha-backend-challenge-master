IMPORTANTE:
En caso que haya algún problema relacionado con los archivos (ya sea del back o del front del proyecto), la versión original se encuentra en mi drive:
https://drive.google.com/file/d/1xtfsFNyNm0WEPNioV8qGVzF1hggvTQlY/view?usp=sharing

Para acceder a los archivos del front se tiene que acceder a este repositorio:
https://github.com/juansantafe7/alquilatucancha-backend-challenge-master-frontIntegration

Intro

Para el proyecto utilicé una virtual machine con sistema operativo Linux
Instalé docker y yarn y todas las dependencias necesarias para que el programa funcione correctamente y se visualice en localhost:3000
Agregué un front utilizando React, el cual está integrado con el back y funciona en el puerto 3002. Para ello tuve que eliminar restricciones CORS

Optimizaciones del proyecto:

En cuanto a las optimizaciones realizadas puedo mencionar:

1. Implementación de un sistema de caching.
Se busca con esto minimizar las solicitudes a la API.
Para este fin se instaló la librería de node cache: npm install node-cache
Se modificó el archivo http-alquila-tu-cancha.client.ts para que tenga la siguiente lógica:
![image](https://github.com/user-attachments/assets/3677749f-391c-493d-9a70-1646ddf2bc76)
![{01008BE0-51E0-41E4-8924-68CF88DEB177}](https://github.com/user-attachments/assets/3dc1163e-b8a1-460e-8ba3-25437852157a)

2. invalidez selectiva del cache y procesamiento asincrónico
Se añadió un servicio (CacheService) para manejar la invalidación de caché.
Se creó un mecanismo para identificar de manera dinámica qué clave de caché se debe invalidar, dependiendo del tipo de evento recibido.
![{F63E5714-4BA8-48EF-A3BD-5759CEB636EB}](https://github.com/user-attachments/assets/8730f811-092d-433d-bca9-426289aa3e2d)

3. Implementación de llamadas paralelas
En lugar de usar un bucle for secuencial, utilicé Promise.all para ejecutar múltiples solicitudes de manera simultánea. 
Esto se aplica tanto al nivel de los clubes (clubs.map) como al nivel de las canchas (courts.map). 
a. Cada club se procesa en paralelo. 
b. Dentro de cada club, las canchas también se procesan en paralelo 
Se modifico el archivo get-availability.handler.ts
![{D2223C26-F253-4C2F-B051-A98DA02863AE}](https://github.com/user-attachments/assets/1b006381-ca4e-4b4a-b51f-810b392f91fb)

4.  Batch Requests (Agrupación de solicitudes)
Se agregó solicitudes en lotes cuando se requiere consultar múltiples recursos (por ejemplo, canchas o slots). Esto reduce 
el número de llamadas a la API mock y mejorará el rendimiento.

5. Configuración de TTL dinámico
Con la finalidad reducir la latencia y sobrecarga y optimizar el uso de memoria
![{CFEB80F9-26DD-4CE8-BFEF-642995D9C37A}](https://github.com/user-attachments/assets/ac7e58f6-b18d-4d4c-8e9b-bda3d5006476)
![{336D7326-5A3B-4966-8E41-83DBF380186E}](https://github.com/user-attachments/assets/017d1b2b-3357-49ab-9106-3b15947d0273)

6. Optimización con stream
Se agregó método @Get('large-data') al events.controller.ts , con el fin de enviar datos grandes mediante streams
![{78A259BB-DA5B-4BB1-9A56-E6897EF4B95C}](https://github.com/user-attachments/assets/c50738b4-ae14-45d6-ba48-e3e7c4945f9f)

7. Pool de conexiones para limitar el número de solicitudes permitidas
Utilizamos la librería p-limit mediante el siguiente comando: npm install p-limit 

8. Pre-fetching dinámico
Con la finalidad de reducir la latencia. Permite cargar datos antes de que sean solicitados por el usuario.
Se agregó prefetching en el archivo http-alquila-tu-cancha.clients.ts
![{12BD5894-674C-4BFF-AA48-7A61F1334F86}](https://github.com/user-attachments/assets/560550c1-4e83-4bc1-9973-9a77c18a8618)






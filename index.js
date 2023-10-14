const http = require('http');
const fetch = require('node-fetch');
const url = require('url');


// Crear un servidor HTTP
const server = http.createServer(async (req, res) => {

  var queryObject = url.parse(req.url, true).query;
  var textParam = queryObject.canal || ''; // Obtén el parámetro de texto de la URL

  if (!textParam){
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Error: El parámetro "text" es requerido en la URL');
  } else {
     const now = Date.now();

      // URL de la API externa a la que queremos llamar
      var apiUrl = `https://www.chilevision.cl:8080/token.php/ms_player_src_01/live_3/${textParam}/${now}.json`; // Reemplaza esto con la URL de la API real que desees usar
      console.log(`api - ${apiUrl}`);


     try {
          const response = await fetch(apiUrl);
          const responseData = await response.json();
          console.dir(responseData);

          if (responseData.token) {
            const token = responseData.token;
            const secondApiUrl = `https://mdstrm.com/live-stream-playlist/${textParam}.m3u8?access_token=${token}`;
            console.log(`https://mdstrm.com/live-stream-playlist/${textParam}.m3u8?access_token=${token}`);

            try {
              const secondApiResponse = await fetch(secondApiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            },
          });
              const secondApiData = await secondApiResponse.text();

              res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
              res.end(secondApiData);
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end(`Error al llamar la segunda API: ${error.message}`);
            }
          } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error: No se pudo encontrar el token en la respuesta de la primera API');
          }
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Error al llamar la primera API: ${error.message}`);
        }

  }
  

});


var port = process.env.PORT || 3000; // Puerto en el que se ejecutará el servidor

server.listen(port, () => {
  console.log(`Servidor Node.js escuchando en el puerto ${port}`);
});
const express = require('express');
const app = express();
const PORT = 3001;

app.get('/test', (req, res) => {
  res.json({ message: 'Teste funcionando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor de teste rodando na porta ${PORT}`);
});
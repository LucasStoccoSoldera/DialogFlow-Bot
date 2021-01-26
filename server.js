const express = require("express");
const app = express();
const { WebhookClient } = require("dialogflow-fulfillment");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const axios = require("axios");
const mysql = require ('mysql');
const nodemailer = require("nodemailer");

//------------------------------------------------------------------------------------ webhook
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
app.post("/WEBHOOK", function(request, response) {
  const agent = new WebhookClient({ request: request, response: response });
  
  var connection = mysql.createConnection({ 
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USER, 
    password: process.env.MYSQL_PASS, 
    database: process.env.MYSQL_DB
  });
  connection.connect();
  //------------------------------------------------------------------------------------ mapping
  //------------------------------------------------------------------------------------ Clientes

var intentName = request.body.queryResult.intent.displayName;

  if(intentName == 'Alugar_livro'){ 
    console.log('Adicionar Aluguel') 
    var Nome_livro = request.body.queryResult.parameters['Nome_livro']; 
    var Nome_pessoa = request.body.queryResult.parameters['Nome_Pessoa'];
    var CPF = request.body.queryResult.parameters['CPF'];
    var Telefone = request.body.queryResult.parameters['Telefone'];  
    var Email = request.body.queryResult.parameters['Email'];
    var Ajuste = 'Não';
    var DataI = new Date();
    let dataFormatadaI = DataI.getFullYear() + "-" + (DataI.getMonth() ) + "-" + (DataI.getDate());
    var DataF = new Date();
    let dataFormatadaF = DataF.getFullYear() + "-" + (DataF.getMonth() ) + "-" + (DataF.getDate() + 7);
    var query = 'insert into TB_ALUGUEL values ("'+Nome_livro+'","'+Nome_pessoa+'","'+CPF+'","'+Telefone+'","'+Email+'","'+Ajuste+'","'+dataFormatadaI+'","'+dataFormatadaF+'")';
    connection.query(query, function (error, results, fields) { 
      if (error) {
response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      
      if (error == "Error: ER_DUP_ENTRY: Duplicate entry '12345678901' for key 'PRIMARY'"){
      response.json({"fulfillmentText" :"O CPF que você tentou utilizar ja está cadastrado, é permitido pegar apenas um livo de cada vez. Por que não tenta outro CPF?"})
      }
      }
      throw error; 
      connection.end();
      });
var transporte = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "3495dced95cc5d",
    pass: "d65c9a79cec394"
  }
});
    var email = {
      from: process.env.user,
      to: Email,
      subject: "Aluguel de Livro da Biblioteca Municipal",
      html: "Sua solicitação do livro "+Nome_livro+" foi adicionada com sucesso! Você poderá pegá-lo a partir de amanhã e a data de devoluçaõ padrão são 7 dias contando apartir de "+dataFormatadaI+"."
    };

    transporte.sendMail(email, function(error, info) {
      if (error) agent.add(error);
      throw error;
    });
      const data = [{ NOME_LIVRO:Nome_livro, NOME_PESSOA:Nome_pessoa, CPF:CPF , TELEFONE:Telefone, EMAIL:Email,AJUSTE:Ajuste, DATA_ALUGUEL:dataFormatadaI, DATA_DEVOLUCAO:dataFormatadaF }]; 
      axios.post ('https://sheet.best/api/sheets/8651532e-c62f-4bbd-b438-a1ebb8e972a5', data); 
      response.json({"fulfillmentText" :"Sua solicitação de aluguel de livro foi enviada! Você poderá buscar o livro a partir de amanhã e a data de devolução padrão é uma samana(7 dias)." }) 
  }
    else if(intentName == 'Agendar_devolução'){ 
    console.log('Pesquisar Aluguel'); 
    var CPF = request.body.queryResult.parameters['CPF']; 
      var ajuste = 'Sim';
      var query = 'select * from TB_ALUGUEL where CPF = "'+CPF+'"';
      var query2 = 'update TB_ALUGUEL set AJUSTE = "'+ajuste+'"where CPF = "'+CPF+'"';

    connection.query(query, function (error, results, fields) {
    connection.query(query2, function (error2, results2, fields2) {
    connection.end();
      });
        if (error) {
response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
      throw error;
      
      
     
var transporte = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "3495dced95cc5d",
    pass: "d65c9a79cec394"
  }
 });
    var email = {
      from: process.env.user,
      to: results[0].EMAIL,
      subject: "Solicitação de ajuste na devolução da Biblioteca Municipal",
      html: "Seu solicitação de ajuste de devolução foi marcada com sucesso, entraremos em contatos posteriormente."
    };

 connection.end();
      });
    transporte.sendMail(email, function(error, info) {
      if (error) agent.add(error);
      throw error;
    });
              }
      else if(intentName == 'Sugestoes'){ 
    console.log('Pesquisar Sugestoes');
    response.json({"fulfillmentText": "As sugestões da semana são:" + "/n" })
    var query = 'select NOME_LIVRO from SUGESTOES'; 
    connection.query(query, function (error, results, fields) {
      if (error) {
response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
      throw error;

      /*
      var contato = "";
      var i=0;
      while(results() !== true){
        contato = 'Nome do livro: '+ results.NOME_LIVRO[i]+ '\n';
        response.json({"fulfillmentText": contato })
        i++; 
      }
connection.end();
    });*/
          var contato = '';
          contato = 'Nome do livro: '+results[0].NOME_LIVRO + '\n' + 
          'Nome do livro: '+results[1].NOME_LIVRO + '\n' + 
          'Nome do livro: '+results[2].NOME_LIVRO + '\n' + 
          'Nome do livro: '+results[3].NOME_LIVRO;
          'Nome do livro: '+results[4].NOME_LIVRO;

          response.json({"fulfillmentText": contato })
    });
  }
    //------------------------------------------------------------------------------------ Funcionário
  else if(intentName == 'Login'){ 
    console.log('Login') 
    var Usuario = request.body.queryResult.parameters['Usuario']; 
    var Senha = request.body.queryResult.parameters['Senha'];

    var query = 'select * from LOGIN where USER = "'+Usuario+'" AND SENHA = "'+Senha+'"' ;
    connection.query(query, function (error, results, fields) { 
    if (error){
    response.json({"fulfillmentText":"Usuário ou senha incorretos." + error }) 
    }
      else{
    connection.end();
    response.json({"fulfillmentText":"Para confirmar sua entrada digite ENTRAR." }) 
      }
    });
  }
 //------------------------------------------------------------------------------------ Login
  if(intentName == 'AddLogin'){ 
    console.log('Adicionar Login') 
    var Usuario = request.body.queryResult.parameters['Usuario']; 
    var Senha = request.body.queryResult.parameters['Senha'];
    var query = 'insert into LOGIN values ("'+Usuario+'","'+Senha+'")'; 
    connection.query(query, function (error, results, fields) { 
      if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
      throw error; 
      connection.end();
      });
      response.json({"fulfillmentText":"Login Adicionado com Sucesso!"})  
  }
    else if(intentName == 'DelLogin'){ 
    console.log('Excluir Login') 
    var Usuario = request.body.queryResult.parameters['Usuario']; 
    var query = 'delete from LOGIN where USER = "'+Usuario+'"';
    connection.query(query, function (error, results, fields) { 
       if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
    throw error; 
    connection.end();
      });
    response.json({"fulfillmentText":"Login "+Usuario+" Apagado com Sucesso!" }) 
    
  }
    else if(intentName == 'AtuLogin'){
    console.log('Atualizar Login')
    var Usuario = request.body.queryResult.parameters['Usuario'];
    var Senha = request.body.queryResult.parameters['Senha'];
    var query = 'update LOGIN set SENHA = "'+Senha+'"';
    connection.query(query, function (error, results, fields) {
            if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" }) 
      }
      throw error;
      connection.end();
      });
      response.json({"fulfillmentText":"Login Alterado com Sucesso!" })
    
  }
  //------------------------------------------------------------------------------------ Aluguel
  else if(intentName == 'DelAluguel'){ 
    console.log('Excluir Aluguel') 
    var CPF= request.body.queryResult.parameters['CPF'];
    var query = 'delete from TB_ALUGUEL where CPF = "'+CPF+'"';
    connection.query(query, function (error, results, fields) { 
          if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" + error}) 
      }
    throw error; 
    connection.end();
      });
    response.json({"fulfillmentText":"Aluguel do portador do cpf "+CPF+" apagado com Sucesso!" }) 
    
  } 
  else if(intentName == 'AtuAluguel - nome'){
    console.log ("Atualizar Aluguel - nome");
    var CPF = request.body.queryResult.parameters['CPF'];
    var Nome_livro = request.body.queryResult.parameters['Nome_livro'];
    var query = 'update TB_ALUGUEL set NOME_LIVRO = "'+Nome_livro+'"where CPF = "'+CPF+'"';
    connection.query(query, function (error, results, fields) {
            if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
      throw error;
      connection.end();
      });
      response.json({"fulfillmentText":"Nome do livro alugado pelo portador do cpf "+CPF+" alterado com Sucesso!" })
    
  }
  else if(intentName == 'AtuAluguel - data'){
    console.log ("Atualizar Contato - data");
    var CPF = request.body.queryResult.parameters['CPF'];
    var Data_devolucao = request.body.queryResult.parameters['Data_devolucao'];
    var query = 'update TB_ALUGUEL set DATA_DEVOLUCAO = "'+Data_devolucao+'"where CPF = "'+CPF+'"';
    connection.query(query, function (error, results, fields) {
            if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
      throw error;
      connection.end();
      });
      response.json({"fulfillmentText":"Data de devolução do livro alugado pelo portador do cpf "+CPF+" alterado com Sucesso!" })
    
  }
    //------------------------------------------------------------------------------------ Sugestão
  else if(intentName == 'AtuSugestao'){
    console.log ("Atualizar Sugestao");
    var Nome_antigo = request.body.queryResult.parameters['Nome_antigo'];
    var Nome_novo = request.body.queryResult.parameters['Nome_novo'];
    var query = 'update SUGESTOES set NOME_LIVRO = "'+Nome_novo+'"where NOME_LIVRO = "'+Nome_antigo+'"';
    connection.query(query, function (error, results, fields) {
            if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
      throw error;
      connection.end();
      });
      response.json({"fulfillmentText":"Sugestão de livro alterada com Sucesso!" })
    
  }
  
    else if(intentName == 'AddSugestao'){ 
    console.log('Adicionar Sugestão') 
    var Nome_livro = request.body.queryResult.parameters['Nome_livro']; 
    var query = 'insert into SUGESTOES values ("'+Nome_livro+'")'; 
    connection.query(query, function (error, results, fields) { 
            if (error) {
        response.json({"fulfillmentText" :"O erro é no banco" + error }) 
      }
      throw error; 
      connection.end();
      }); 
      const data = [{ NOME_LIVRO:Nome_livro }]; 
   axios.post ('https://sheet.best/api/sheets/772bf60b-de87-4119-adc5-1ad379c624b9', data);
      response.json({"fulfillmentText" :"Sugestão de livro adicionada com Sucesso!" }) 
    
  }
//------------------------------------------------------------------------------------ Sheets
  
});
// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

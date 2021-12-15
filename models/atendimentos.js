const axios  = require('axios');
const moment = require('moment')
const conexao = require('../infraestrutura/database/conexao')

const repositorio = require('./../repositorios/atendimento')


class Atendimento{

    adiciona(atendimento, res){

        const dataCriacao = moment().format('YYYY-MM-DD HH:MM:SS')
        const data = moment(atendimento.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS')

        const dtaValida = moment(data).isSameOrAfter(dataCriacao);
        const clienteValido = atendimento.cliente.length >= 5

        const validacoes = [
            {
                nome : 'data',
                valido: dtaValida,
                mensagem: 'Data deve ser maior ou igual a data atual'
        
            },
            {
                nome: 'cliente',
                valido: clienteValido,
                mensagem: 'cliente deve ter pelo menos 5 caracteres'
            }
        ]

        const erros = validacoes.filter(campo => !campo.valido);

        const existemErros = erros.length

        if(existemErros){
            res.status(400).json(erros);
        }else{

            
            const atendimentoDatado = {...atendimento, dataCriacao, data}
            
            return repositorio.adiciona(atendimentoDatado)
                .then((resultados)=>{
                    const id = resultados.insertId
                    return({...atendimento, id})
                }) 
        }
    }

    lista(res){
        const sql = 'SELECT * FROM Atendimentos'

        conexao.query(sql, (erro, resultados)=>{
            if(erro){
                res.status(400).json(erro)
            }else{
                res.status(200).json(resultados)
            }
        })
    }

    buscaPorId(id,res){
        const sql = `SELECT * FROM Atendimentos WHERE  id=${id}`

        conexao.query(sql, async(erro, resultados)=>{

            const atendimento = resultados[0];
            const cpf = atendimento.cliente;
            if(erro){
                res.status(400).json(erro)
            }else{

                const {data} = await axios.get(`http://localhost:8082/${cpf}`)
                atendimento.cliente = data;
                res.status(201).json(resultados)
            }
        })
    }

    altera(id, valores, res){


        if(valores.data){
            valores.data = moment(valores.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS' )
        }
        const sql = `UPDATE Atendimentos SET ? Where id = ?`

        conexao.query(sql, [valores, id], (erro, resultados) => {
            if(erro){
                res.status(400).json(erro);
            }else{
                res.status(200).json(resultados)
            }
        } )

    }

    deleta(id, res){
        const sql = 'DELETE FROM Atendimentos WHERE id=?'

        conexao.query(sql, id, (erro, resultados)=>{
            if(erro){
                res.status(400).json(erro)
            }else{
                res.status(200).json({id})
            }
        })
    }
}

module.exports = new Atendimento


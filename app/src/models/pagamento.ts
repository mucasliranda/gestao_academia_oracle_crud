import oracledb from "oracledb";
import prompt from "prompt";
import { excludeId, printTables } from "../utils";
import { MongoClient } from "../mongo";



const mongoClient = new MongoClient();

export class Pagamento {
  static async getPagamentos() {
    await mongoClient.connect();

    const rows = excludeId(await mongoClient.db.collection('pagamento').find({}).toArray());

    await mongoClient.close();

    printTables(rows)
  }

  static async inserirPagamento() {
    const properties = {
      matricula: {
        description: 'Matricula',
        pattern: /^[0-9]{5}$/,
        message: 'Matricula inválida',
        required: true
      },
      data: {
        description: 'Data de pagamento (dd/mm/aaaa))',
        pattern: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
        message: 'Data de pagamento inválida',
        required: true
      },
    }

    const { matricula, data } = await prompt.get({ properties });

    try {
      await mongoClient.connect();

      await mongoClient.db.collection('pagamento').insertOne({
        MATRICULA: matricula,
        DATA_PAGAMENTO: data.toString().split('/').reverse().join('-')
      });

      await mongoClient.close();

      console.log('Pagamento inserido com sucesso!');

      const { opcao } = await prompt.get({
        properties: {
          opcao: {
            description: 'Deseja inserir outro pagamento? (s/n)',
            pattern: /^[sn]$/,
            message: 'Opção inválida',
            required: true
          }
        }
      });

      if (opcao === 'n') {
        return;
      }
    } catch (err) {
      console.log('Erro ao inserir pagamento');
      console.log(err);
    }
  }

  static async removerPagamento() {
    await mongoClient.connect();

    const result = excludeId(await mongoClient.db.collection('pagamento').find({}).toArray());

    printTables(result)
    
    const properties = {
      id: {
        description: 'ID',
        pattern: /^[0-9]{1,100}$/,
        message: 'ID inválida',
        required: true
      }
    }

    const { id } = await prompt.get({ properties });

    try {
      await mongoClient.db.collection('pagamento').deleteOne({ ID: id });

      await mongoClient.close();

      console.log('Pagamento removido com sucesso!');
    } catch (error) {
      console.log('Erro ao remover pagamento');
      console.log(error);
    }
  }

  static async atualizarPagamento() {
    const properties = {
      id: {
        description: 'ID',
        pattern: /^[0-9]{1,100}$/,
        message: 'ID inválida',
        required: true
      }
    }

    while (true) {
      const { id } = await prompt.get({ properties });

      await mongoClient.connect();

      // const pagamento = await connection.execute(`
      //   SELECT
      //     ID,
      //     MATRICULA,
      //     DATA_PAGAMENTO
      //   FROM PAGAMENTO WHERE ID = :id
      // `, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

      const pagamento = await mongoClient.db.collection('pagamento').findOne({ ID: id });

      // @ts-ignore
      if (!pagamento) {
        console.log('Pagamento não encontrado');
        return;
      }

      const properties2 = {
        matricula: {
          description: 'Matricula',
          pattern: /^[0-9]{5}$/,
          message: 'Matricula inválida',
          required: false,
          // @ts-ignore
          default: pagamento.MATRICULA
        },
        data: {
          description: 'Data de pagamento (dd/mm/aaaa))',
          pattern: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
          message: 'Data de pagamento inválida',
          required: false,
          // @ts-ignore
          default: new Date(pagamento.DATA_PAGAMENTO).toLocaleDateString()
        },
      }

      console.log('Deixe em branco para manter o valor atual.')

      const { matricula, data } = await prompt.get({ properties: properties2 });

      try {
        await mongoClient.db.collection('pagamento').updateOne({ ID: id }, {
          MATRICULA: matricula,
          DATA_PAGAMENTO: data.toString().split('/').reverse().join('-')
        });

        await mongoClient.close();

        console.log('Pagamento atualizado com sucesso!');
      } catch (error) {
        console.log('Erro ao atualizar pagamento');
        console.log(error);
      }

      const { opcao } = await prompt.get({
        properties: {
          opcao: {
            description: 'Deseja atualizar outro pagamento? (s/n)',
            pattern: /^[sn]$/,
            message: 'Opção inválida',
            required: true
          }
        }
      });

      if (opcao === 'n') {
        return;
      }
    }
  }
}
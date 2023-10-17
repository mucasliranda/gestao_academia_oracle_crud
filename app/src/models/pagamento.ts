import oracledb from "oracledb";
import prompt from "prompt";
import { printTables } from "../utils";



export class Pagamento {
  static async getPagamentos() {
    const connection = await oracledb.getConnection();

    const sql = 'SELECT * FROM PAGAMENTO';

    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const rows = result.rows;

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

    const connection = await oracledb.getConnection();

    const sql = `
      INSERT INTO PAGAMENTO (
        ID,
        MATRICULA,
        DATA_PAGAMENTO
      ) VALUES (
        C##LABDATABASE.PAGAMENTO_ID_SEQ.NEXTVAL,
        :matricula,
        TO_DATE(:data, 'YYYY/MM/DD')
      )
    `;

    try {
      await connection.execute(sql, [matricula, data.toString().split('/').reverse().join('-')])

      await connection.commit();

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
    const connection = await oracledb.getConnection();

    const result = await connection.execute('SELECT * FROM PAGAMENTO', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    printTables(result.rows)
    
    const properties = {
      id: {
        description: 'ID',
        pattern: /^[0-9]{1,100}$/,
        message: 'ID inválida',
        required: true
      }
    }

    const { id } = await prompt.get({ properties });

    const sql = `
      DELETE FROM PAGAMENTO
      WHERE ID = :id
    `;

    try {
      await connection.execute(sql, [id]);

      await connection.commit();

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

      const connection = await oracledb.getConnection();

      const pagamento = await connection.execute(`
        SELECT
          ID,
          MATRICULA,
          DATA_PAGAMENTO
        FROM PAGAMENTO WHERE ID = :id
      `, [id], { outFormat: oracledb.OUT_FORMAT_OBJECT });

      // @ts-ignore
      if (pagamento.rows.length === 0) {
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
          default: pagamento.rows[0].MATRICULA
        },
        data: {
          description: 'Data de pagamento (dd/mm/aaaa))',
          pattern: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
          message: 'Data de pagamento inválida',
          required: false,
          // @ts-ignore
          default: new Date(pagamento.rows[0].DATA_PAGAMENTO).toLocaleDateString()
        },
      }

      console.log('Deixe em branco para manter o valor atual.')

      const { matricula, data } = await prompt.get({ properties: properties2 });

      const sql = `
        UPDATE PAGAMENTO SET
          MATRICULA = :matricula,
          DATA_PAGAMENTO = TO_DATE(:data, 'YYYY/MM/DD')
        WHERE ID = :id
      `;

      try {
        await connection.execute(sql, [matricula, data.toString().split('/').reverse().join('-'), id]);

        await connection.commit();

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
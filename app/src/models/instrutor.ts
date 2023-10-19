import oracledb from 'oracledb';
import prompt from 'prompt';
import { printTables } from '../utils';



export class Instrutor {
  static async getInstrutores() {
    const connection = await oracledb.getConnection();

    const sql = `
      SELECT
        MATRICULA,
        NOME
        CPF,
        EMAIL,
        TELEFONE
      FROM 
        INSTRUTOR
    `;

    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const rows = result.rows;

    printTables(rows)
  }

  static async getQuantidadeAlunosPorInstrutores() {
    const connection = await oracledb.getConnection();

    const sql = `
      SELECT 
        I.NOME,
        COUNT(A.INSTRUTOR) AS ALUNOS
      FROM 
        INSTRUTOR I
      INNER JOIN 
        ALUNO A ON I.MATRICULA = A.INSTRUTOR
      GROUP BY 
        I.NOME
      ORDER BY 
        ALUNOS DESC
    `;

    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const rows = result.rows as {
      NOME: string;
      ALUNOS: number;
    }[];

    printTables(rows)
  }

  static async inserirInstrutor() {
    const properties = {
      nome: {
        description: 'Nome',
        pattern: /^[a-zA-Z\s]{1,100}$/,
        message: 'Nome inválido',
        required: true
      },
      cpf: {
        description: 'CPF',
        pattern: /^[0-9]{11}$/,
        message: 'CPF inválido',
        required: true
      },
      email: {
        description: 'Email',
        pattern: /^[a-zA-Z0-9@.]{1,200}$/,
        message: 'Email inválido',
        required: true
      },
      telefone: {
        description: 'Telefone (ddd + número)',
        pattern: /^[0-9]{11}$/,
        message: 'Telefone inválido',
        required: true
      }
    }

    const { nome, cpf, email, telefone, alunos } = await prompt.get({ properties });

    const connection = await oracledb.getConnection();

    const sql = `
      INSERT INTO INSTRUTOR (
        MATRICULA,
        NOME,
        CPF,
        EMAIL,
        TELEFONE
      ) VALUES (
        C##LABDATABASE.INSTRUTOR_MATRICULA_SEQ.NEXTVAL,
        :nome,
        :cpf,
        :email,
        :telefone
      )
    `;


    try {
      await connection.execute(sql, [nome, cpf, email, telefone]);

      await connection.commit();

      console.log('Instrutor inserido com sucesso!');

      const { opcao } = await prompt.get({
        properties: {
          opcao: {
            description: 'Deseja inserir outro instrutor? (s/n)',
            pattern: /^[sn]$/,
            message: 'Opção inválida',
            required: true
          }
        }
      });

      if (opcao === 'n') {
        return;
      }
    } catch (error) {
      console.log('Erro ao inserir instrutor');
      console.log(error);
    }
  }

  static async removerInstrutor() {
    const connection = await oracledb.getConnection();

    const result = await connection.execute(`
      SELECT
        MATRICULA,
        NOME
        CPF,
        EMAIL,
        TELEFONE
      FROM 
        INSTRUTOR
    `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    printTables(result.rows)

    const properties = {
      matricula: {
        description: 'Matricula',
        pattern: /^[0-9]{5}$/,
        message: 'Matricula inválida',
        required: true
      }
    }

    const { matricula } = await prompt.get({ properties });

    const sql = `
      DELETE FROM INSTRUTOR
      WHERE MATRICULA = :matricula
    `;

    const instrutor = await connection.execute(`
      SELECT * FROM INSTRUTOR WHERE MATRICULA = :matricula
    `, [matricula], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (instrutor.rows == undefined || instrutor.rows.length === 0) {
      console.log('Instrutor não encontrado')
      return;
    }

    const { opcao } = await prompt.get({
      properties: {
        opcao: {
          description: 'Deseja realmente remover o instrutor? (s/n)',
          pattern: /^[sn]$/,
          message: 'Opção inválida',
          required: true
        }
      }
    });

    if (opcao === 'n') {
      return;
    }

    try {
      await connection.execute(sql, [matricula]);

      await connection.commit();

      console.log('Instrutor removido com sucesso!');
    } catch (error) {
      console.log('Erro ao remover instrutor');
      console.log(error);
    }
  }

  static async atualizarInstrutor() {
    const properties = {
      matricula: {
        description: 'Matricula',
        pattern: /^[0-9]{5}$/,
        message: 'Matricula inválida',
        required: true
      }
    }

    while (true) {
      const { matricula } = await prompt.get({ properties });

      const connection = await oracledb.getConnection();

      const instrutor = await connection.execute(`
        SELECT * FROM INSTRUTOR WHERE MATRICULA = :matricula
      `, [matricula], { outFormat: oracledb.OUT_FORMAT_OBJECT });

      if (instrutor.rows == undefined || instrutor.rows.length === 0) {
        console.log('Instrutor não encontrado')
        return;
      }

      const properties2 = {
        nome: {
          description: 'Nome',
          pattern: /^[a-zA-Z\s]{1,100}$/,
          message: 'Nome inválido',
          required: false,
          // @ts-ignore
          default: instrutor.rows[0].NOME
        },
        cpf: {
          description: 'CPF',
          pattern: /^[0-9]{11}$/,
          message: 'CPF inválido',
          required: false,
          // @ts-ignore
          default: instrutor.rows[0].CPF
        },
        email: {
          description: 'Email',
          pattern: /^[a-zA-Z0-9@.]{1,200}$/,
          message: 'Email inválido',
          required: false,
          // @ts-ignore
          default: instrutor.rows[0].EMAIL
        },
        telefone: {
          description: 'Telefone (ddd + número)',
          pattern: /^[0-9]{11}$/,
          message: 'Telefone inválido',
          required: false,
          // @ts-ignore
          default: instrutor.rows[0].TELEFONE
        }
      }

      console.log('Deixe em branco para manter o valor atual.')

      const { nome, cpf, email, telefone } = await prompt.get({ properties: properties2 });

      const sql = `
        UPDATE INSTRUTOR SET
          NOME = :nome,
          CPF = :cpf,
          EMAIL = :email,
          TELEFONE = :telefone
        WHERE MATRICULA = :matricula
      `;

      try {
        await connection.execute(sql, [nome, cpf, email, telefone, matricula]);

        await connection.commit();

        console.log('Instrutor atualizado com sucesso!');
      } catch (error) {
        console.log('Erro ao atualizar instrutor');
        console.log(error);
      }

      const { opcao } = await prompt.get({
        properties: {
          opcao: {
            description: 'Deseja atualizar outro instrutor? (s/n)',
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


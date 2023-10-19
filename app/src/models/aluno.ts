import oracledb from 'oracledb';
import prompt from 'prompt';
import { printTables } from '../utils';



export class Aluno {
  static async getAlunos() {
    const connection = await oracledb.getConnection();

    const sql = `
      SELECT
        A.MATRICULA,
        A.NOME,
        A.CPF,
        A.EMAIL,
        A.TELEFONE,
        A.DATA_NASCIMENTO,
        A.CONDICAO_MATRICULA,
        A.INSTRUTOR,
        I.NOME AS NOME_INSTRUTOR
      FROM
        ALUNO A
      INNER JOIN 
        INSTRUTOR I ON I.MATRICULA = A.INSTRUTOR
    `;

    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const rows = result.rows;

    printTables(rows)
  }

  static async inserirAluno() {
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
      },
      dataNascimento: {
        description: 'Data de nascimento (dd/mm/aaaa))',
        pattern: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
        message: 'Data de nascimento inválida',
        required: true
      },
      instrutor: {
        description: 'Matricula do instrutor',
        pattern: /^[0-9]{5}$/,
        message: 'Matricula do instrutor inválida',
        required: true
      },
    }

    while(true) {
      const { nome, cpf, email, telefone, dataNascimento, instrutor } = await prompt.get({properties});
      
      const connection = await oracledb.getConnection();

      const sql = `
        INSERT INTO ALUNO (
          MATRICULA,
          NOME,
          CPF,
          EMAIL,
          TELEFONE,
          DATA_NASCIMENTO,
          INSTRUTOR,
          CONDICAO_MATRICULA
        ) VALUES (
          C##LABDATABASE.ALUNO_MATRICULA_SEQ.NEXTVAL,
          :nome,
          :cpf,
          :email,
          :telefone,
          TO_DATE(:dataNascimento, 'DD/MM/YYYY'),
          :instrutor,
          1
        )
      `;

      try {
        const result = await connection.execute(sql, [nome, cpf, email, telefone, dataNascimento, instrutor], { autoCommit: true });
  
        console.log('Aluno inserido com sucesso!');
  
        const { opcao } = await prompt.get({
          properties: {
            opcao: {
              description: 'Deseja inserir outro aluno? (s/n)',
              pattern: /^[sn]$/,
              message: 'Opção inválida',
              required: true
            }
          }
        });
  
        if(opcao === 'n') {
          return;
        }
      } catch (err) {
        console.log(err)
        console.log('Tivemos um problema ao inserir o aluno, tente novamente')
      }
    }
  }

  static async removerAluno() {
    const connection = await oracledb.getConnection();

    const result = await connection.execute(`
      SELECT
        A.MATRICULA,
        A.NOME,
        A.CPF,
        A.EMAIL,
        A.TELEFONE,
        A.DATA_NASCIMENTO,
        A.CONDICAO_MATRICULA,
        A.INSTRUTOR,
        I.NOME AS NOME_INSTRUTOR
      FROM
        ALUNO A
      INNER JOIN 
        INSTRUTOR I ON I.MATRICULA = A.INSTRUTOR
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

    const { matricula } = await prompt.get({properties});

    const sql = `
      DELETE FROM ALUNO WHERE MATRICULA = :matricula
    `;

    try {
      const result = await connection.execute(sql, [matricula]);

      await connection.commit();
  
      console.log(result)

      console.log('Aluno removido com sucesso!');
    } catch (err) {
      console.log('Erro ao remover aluno');
      console.log(err);
    }
  }

  static async atualizarAluno() {
    const properties = {
      matricula: {
        description: 'Matricula',
        pattern: /^[0-9]{5}$/,
        message: 'Matricula inválida',
        required: true
      }
    }

    while (true) {
      const { matricula } = await prompt.get({properties});

      const connection = await oracledb.getConnection();
  
      const aluno = await connection.execute(`
        SELECT
          MATRICULA,
          NOME,
          CPF,
          EMAIL,
          TELEFONE,
          DATA_NASCIMENTO,
          INSTRUTOR
        FROM
          ALUNO
        WHERE
          MATRICULA = :matricula
      `, [matricula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  
      if (aluno.rows == undefined || aluno.rows.length === 0) {
        console.log('Aluno não encontrado')
        return;
      }
  
      const properties2 = {
        nome: {
          description: 'Nome',
          pattern: /^[a-zA-Z\s]{1,100}$/,
          message: 'Nome inválido',
          required: false,
          // @ts-ignore
          default: aluno.rows[0].NOME
        },
        cpf: {
          description: 'CPF',
          pattern: /^[0-9]{11}$/,
          message: 'CPF inválido',
          required: false,
          // @ts-ignore
          default: aluno.rows[0].CPF
        },
        email: {
          description: 'Email',
          pattern: /^[a-zA-Z0-9@.]{1,200}$/,
          message: 'Email inválido',
          required: false,
          // @ts-ignore
          default: aluno.rows[0].EMAIL
        },
        telefone: {
          description: 'Telefone (ddd + número)',
          pattern: /^[0-9]{11}$/,
          message: 'Telefone inválido',
          required: false,
          // @ts-ignore
          default: aluno.rows[0].TELEFONE
        },
        dataNascimento: {
          description: 'Data de nascimento (dd/mm/aaaa))',
          pattern: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
          message: 'Data de nascimento inválida',
          required: false,
          // @ts-ignore
          default: new Date(aluno.rows[0].DATA_NASCIMENTO).toLocaleDateString()
        },
        instrutor: {
          description: 'Matricula do instrutor',
          pattern: /^[0-9]{5}$/,
          message: 'Matricula do instrutor inválida',
          required: false,
          // @ts-ignore
          default: aluno.rows[0].INSTRUTOR
        }
      }
  
      console.log('Deixe em branco para manter o valor atual.')
  
      const { nome, cpf, email, telefone, dataNascimento, instrutor } = await prompt.get({properties: properties2});
  
      const sql = `
        UPDATE ALUNO SET
          NOME = :nome,
          CPF = :cpf,
          EMAIL = :email,
          TELEFONE = :telefone,
          DATA_NASCIMENTO = TO_DATE(:dataNascimento, 'DD/MM/YYYY'),
          INSTRUTOR = :instrutor
        WHERE MATRICULA = :matricula
      `;
  
      try {
        const result = await connection.execute(sql, [nome, cpf, email, telefone, dataNascimento, instrutor, matricula], { autoCommit: true });
    
        await connection.commit();

        console.log('Aluno atualizado com sucesso!');
      } catch (err) {
        console.log('Erro ao atualizar aluno');
        console.log(err);
      }

      const { opcao } = await prompt.get({
        properties: {
          opcao: {
            description: 'Deseja atualizar outro aluno? (s/n)',
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

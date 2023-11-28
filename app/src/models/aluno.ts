import oracledb from 'oracledb';
import prompt from 'prompt';
import { excludeId, printTables } from '../utils';
import { MongoClient } from '../mongo';



const mongoClient = new MongoClient();

export class Aluno {
  static async getAlunos() {
    await mongoClient.connect();

    const rows = excludeId(await mongoClient.db.collection('aluno').find({}).toArray());

    await mongoClient.close();

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
      
      try {
        await mongoClient.connect();

        console.log(`vou inserir ${dataNascimento.toString()}`)

        await mongoClient.db.collection('aluno').insertOne({
          nome,
          cpf,
          email,
          telefone,
          dataNascimento: new Date(dataNascimento.toString().split('/').reverse().join('-')),
          instrutor
        });

        await mongoClient.close();

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
    await mongoClient.connect();

    const result = excludeId(await mongoClient.db.collection('aluno').find({}).toArray());

    printTables(result)

    const properties = {
      matricula: {
        description: 'Matricula',
        pattern: /^[0-9]{5}$/,
        message: 'Matricula inválida',
        required: true
      }
    }

    const { matricula } = await prompt.get({properties});

    try {
      await mongoClient.db.collection('aluno').deleteOne({ MATRICULA: matricula });

      await mongoClient.close();

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

      await mongoClient.connect();
  
      const aluno = await mongoClient.db.collection('aluno').findOne({ MATRICULA: matricula });

      if (!aluno) {
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
          default: aluno.NOME
        },
        cpf: {
          description: 'CPF',
          pattern: /^[0-9]{11}$/,
          message: 'CPF inválido',
          required: false,
          // @ts-ignore
          default: aluno.CPF
        },
        email: {
          description: 'Email',
          pattern: /^[a-zA-Z0-9@.]{1,200}$/,
          message: 'Email inválido',
          required: false,
          // @ts-ignore
          default: aluno.EMAIL
        },
        telefone: {
          description: 'Telefone (ddd + número)',
          pattern: /^[0-9]{11}$/,
          message: 'Telefone inválido',
          required: false,
          // @ts-ignore
          default: aluno.TELEFONE
        },
        dataNascimento: {
          description: 'Data de nascimento (dd/mm/aaaa))',
          pattern: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
          message: 'Data de nascimento inválida',
          required: false,
          // @ts-ignore
          default: new Date(aluno.DATA_NASCIMENTO).toLocaleDateString()
        },
        instrutor: {
          description: 'Matricula do instrutor',
          pattern: /^[0-9]{5}$/,
          message: 'Matricula do instrutor inválida',
          required: false,
          // @ts-ignore
          default: aluno.INSTRUTOR
        }
      }
  
      console.log('Deixe em branco para manter o valor atual.')
  
      const { nome, cpf, email, telefone, dataNascimento, instrutor } = await prompt.get({properties: properties2});
  
      try {
        await mongoClient.db.collection('aluno').updateOne({ MATRICULA: matricula }, {
          $set: {
            NOME: nome,
            CPF: cpf,
            EMAIL: email,
            TELEFONE: telefone,
            DATA_NASCIMENTO: new Date(dataNascimento.toString().split('/').reverse().join('-')),
            INSTRUTOR: instrutor
          }
        });

        await mongoClient.close();

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

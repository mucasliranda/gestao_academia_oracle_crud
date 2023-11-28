import oracledb from 'oracledb';
import prompt from 'prompt';
import { excludeId, printTables } from '../utils';
import { MongoClient } from '../mongo';



const mongoClient = new MongoClient();

export class Instrutor {
  static async getInstrutores() {
    await mongoClient.connect();

    const rows = excludeId(await mongoClient.db.collection('instrutor').find({}).toArray());

    await mongoClient.close();

    printTables(rows)
  }

  static async getQuantidadeAlunosPorInstrutores() {
    await mongoClient.connect();

    const rows = excludeId(await mongoClient.db.collection('instrutor').aggregate([
      {
        $lookup: {
          from: 'aluno',
          localField: 'MATRICULA',
          foreignField: 'INSTRUTOR',
          as: 'ALUNOS'
        }
      },
      {
        $project: {
          NOME: 1,
          ALUNOS: {
            $size: '$ALUNOS'
          }
        }
      }
    ]).toArray());

    await mongoClient.close();

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

    try {
      await mongoClient.connect();

      await mongoClient.db.collection('instrutor').insertOne({
        NOME: nome,
        CPF: cpf,
        EMAIL: email,
        TELEFONE: telefone
      });

      await mongoClient.close();

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
    await mongoClient.connect();

    const result = excludeId(await mongoClient.db.collection('instrutor').find({}).toArray());

    printTables(result)

    const properties = {
      matricula: {
        description: 'Matricula',
        pattern: /^[0-9]{5}$/,
        message: 'Matricula inválida',
        required: true
      }
    }

    const { matricula } = await prompt.get({ properties });

    const existInstrutor = (await mongoClient.db.collection('instrutor').findOne({ MATRICULA: matricula }));

    if (!existInstrutor) {
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
      await mongoClient.db.collection('instrutor').deleteOne({ MATRICULA: matricula });

      await mongoClient.close();

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

      await mongoClient.connect();

      const instrutor = await mongoClient.db.collection('instrutor').findOne({ MATRICULA: matricula });

      if (!instrutor) {
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
          default: instrutor.NOME
        },
        cpf: {
          description: 'CPF',
          pattern: /^[0-9]{11}$/,
          message: 'CPF inválido',
          required: false,
          // @ts-ignore
          default: instrutor.CPF
        },
        email: {
          description: 'Email',
          pattern: /^[a-zA-Z0-9@.]{1,200}$/,
          message: 'Email inválido',
          required: false,
          // @ts-ignore
          default: instrutor.EMAIL
        },
        telefone: {
          description: 'Telefone (ddd + número)',
          pattern: /^[0-9]{11}$/,
          message: 'Telefone inválido',
          required: false,
          // @ts-ignore
          default: instrutor.TELEFONE
        }
      }

      console.log('Deixe em branco para manter o valor atual.')

      const { nome, cpf, email, telefone } = await prompt.get({ properties: properties2 });

      try {
        await mongoClient.db.collection('instrutor').updateOne({ MATRICULA: matricula }, {
          $set: {
            NOME: nome,
            CPF: cpf,
            EMAIL: email,
            TELEFONE: telefone
          }
        });

        await mongoClient.close();

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


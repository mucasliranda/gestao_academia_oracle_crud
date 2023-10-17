import prompt from "prompt";
import { Aluno } from "./aluno";
import { Instrutor } from "./instrutor";
import { Pagamento } from "./pagamento";





export default class Menu {
  static _opcoes = {
    '0': this.quit,
    '1': this.exibirRelatorios,
    '2': this.inserirRegistro,
    '3': this.removerRegistro,
    '4': this.atualizarRegistro,
  }

  static async run() {
    const properties = {
      opcao: {
        description: 'Opção',
        pattern: /^[0-4]$/,
        message: 'Opção inválida',
        required: true
      }
    }
    this.intro();

    while(true) {
      this.displayMenu();
      
      const { opcao } = await prompt.get({properties});

      // @ts-ignore
      await this._opcoes[opcao]();
    }
  }

  static displayMenu() {
    console.log(`
1 - Relatórios
2 - Inserir Registros
3 - Remover Registros
4 - Atualizar Registros
0 - Sair
    `)
  }

  static async exibirRelatorios() {
    const properties = {
      opcao: {
        description: 'Opção',
        pattern: /^[0-3]$/,
        message: 'Opção inválida',
        required: true
      }
    }

    while(true) {
      console.log(`
1 - Alunos
2 - Instrutores
3 - Quantidade de alunos por instrutores
0 - Voltar
      `)
  
      const { opcao } = await prompt.get({properties});
  
      switch(opcao) {
        case '1':
          await Aluno.getAlunos()
          break;
        case '2':
          await Instrutor.getInstrutores()
          break;
        case '3':
          await Instrutor.getQuantidadeAlunosPorInstrutores()
          break;
        case '0':
          return;
      }
    }
  }

  static async inserirRegistro() {
    const properties = {
      opcao: {
        description: 'Opção',
        pattern: /^[0-3]$/,
        message: 'Opção inválida',
        required: true
      }
    }

    while(true) {
      console.log(`
1 - Alunos
2 - Instrutores
3 - Pagamento
0 - Voltar
      `)
  
      const { opcao } = await prompt.get({properties});

      switch(opcao) {
        case '1':
          await Aluno.inserirAluno()
          break;
        case '2':
          await Instrutor.inserirInstrutor()
          break;
        case '3':
          await Pagamento.inserirPagamento()
          break;
        case '0':
          return;
      }
    }
  }

  static async removerRegistro() {
    const properties = {
      opcao: {
        description: 'Opção',
        pattern: /^[0-3]$/,
        message: 'Opção inválida',
        required: true
      }
    }

    while(true) {
      console.log(`
1 - Alunos
2 - Instrutores
3 - Pagamento
0 - Voltar
      `)
  
      const { opcao } = await prompt.get({properties});
  
      switch(opcao) {
        case '1':
          await Aluno.removerAluno()
          break;
        case '2':
          await Instrutor.removerInstrutor()
          break;
        case '3':
          await Pagamento.removerPagamento()
          break;
        case '0':
          return;
      }
    }
  }

  static async atualizarRegistro() {
    const properties = {
      opcao: {
        description: 'Opção',
        pattern: /^[0-3]$/,
        message: 'Opção inválida',
        required: true
      }
    }

    while(true) {
      console.log(`
1 - Alunos
2 - Instrutores
3 - Pagamento
0 - Voltar
      `)
  
      const { opcao } = await prompt.get({properties});
  
      switch(opcao) {
        case '1':
          await Aluno.atualizarAluno()
          break;
        case '2':
          await Instrutor.atualizarInstrutor()
          break;
        case '3':
          await Pagamento.atualizarPagamento()
          break;
        case '0':
          return;
      }
    }
  }

  static intro() {

    console.log("#####################################")
    console.log("#   SISTEMA DE GESTÃO DE ACADEMIA   #")
    console.log("#                                   #")
    console.log("#                                   #")
    console.log("#   TOTAL DE REGISTROS EXISTENTES   #")
    console.log("#                                   #")
    console.log("#                                   #")
    console.log("#                                   #")
    console.log("#   CRIADO POR: LUCAS MIRANDA       #")
    console.log("#               ARTHUR BLANDINO     #")
    console.log("#               TIAGO CARCANHOLO    #")
    console.log("#               MATHEUS PASSOS      #")
    console.log("#                                   #")
    console.log("#   DISCIPLINA: BANCO DE DADOS      #")
    console.log("#               2023/2              #")
    console.log("#   PROFESSOR:  HOWARD ROATTI       #")
    console.log("#####################################")

  }

  static quit() {
    process.exit(0)
  }
}
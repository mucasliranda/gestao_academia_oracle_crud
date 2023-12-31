
/*CREATE TABLES*/
CREATE TABLE C##LABDATABASE.ALUNO ( 
    MATRICULA VARCHAR2(5) NOT NULL,
    NOME VARCHAR2(100) NOT NULL,
    CPF VARCHAR2(11) NOT NULL,
    EMAIL VARCHAR2(200) NOT NULL,
    TELEFONE VARCHAR2(11),
    DATA_NASCIMENTO DATE NOT NULL,
    INSTRUTOR VARCHAR2(100),
    /*0 para falso e 1 para verdadeiro
    coluna para saber se o aluno está matriculado*/
    CONDICAO_MATRICULA NUMBER(1) CHECK (CONDICAO_MATRICULA IN (0, 1)),
    CONSTRAINT MATRICULA_PK PRIMARY KEY (MATRICULA)
);

CREATE TABLE C##LABDATABASE.INSTRUTOR (
    MATRICULA VARCHAR2(5) NOT NULL,
    NOME VARCHAR2(100) NOT NULL,
    CPF VARCHAR2(11) NOT NULL,
    EMAIL VARCHAR2(200) NOT NULL,
    TELEFONE VARCHAR2(11),
    ALUNOS VARCHAR2(100),
    CONSTRAINT MATRICULA_INSTRUTOR_PK PRIMARY KEY (MATRICULA)
);

CREATE TABLE C##LABDATABASE.PAGAMENTO (
    ID VARCHAR2(5) NOT NULL,
    MATRICULA VARCHAR2(5) NOT NULL,
    DATA_PAGAMENTO DATE NOT NULL,
    CONSTRAINT ID_PAGAMENTO_PK PRIMARY KEY (ID)
);

/*CREATE SEQUENCES*/
CREATE SEQUENCE C##LABDATABASE.ALUNO_MATRICULA_SEQ
START WITH 10000
INCREMENT BY 1
NOMAXVALUE
NOCYCLE;

CREATE SEQUENCE C##LABDATABASE.INSTRUTOR_MATRICULA_SEQ
START WITH 77777
INCREMENT BY 1
NOMAXVALUE
NOCYCLE;

CREATE SEQUENCE C##LABDATABASE.PAGAMENTO_ID_SEQ
START WITH 1
INCREMENT BY 1
NOMAXVALUE
NOCYCLE;

/*CREATE INDEXES*/
CREATE INDEX C##LABDATABASE.ALUNO_IDX
ON C##LABDATABASE.ALUNO (MATRICULA);

/*CREATE VIEWS*/


/*ADD FOREIGN KEY*/
/*RELAÇÃO DE PAGAMENTO DA MATRICULA*/
ALTER TABLE C##LABDATABASE.PAGAMENTO 
ADD CONSTRAINT PAGAMENTO_ALUNO_MATRICULA_FK
FOREIGN KEY (MATRICULA)
REFERENCES C##LABDATABASE.ALUNO (MATRICULA)
ON DELETE CASCADE;


/*ALUNOS DO INSTRUTOR REFERENCIADOS PELA MATRICULA*/
ALTER TABLE C##LABDATABASE.INSTRUTOR
ADD CONSTRAINT INSTRUTOR_ALUNO_MATRICULA_FK
FOREIGN KEY (ALUNOS)
REFERENCES C##LABDATABASE.ALUNO (MATRICULA)
ON DELETE CASCADE;

/*Garante acesso total as tabelas*/
GRANT ALL ON C##LABDATABASE.FORNECEDORES TO C##LABDATABASE;
GRANT ALL ON C##LABDATABASE.CLIENTES TO C##LABDATABASE;
GRANT ALL ON C##LABDATABASE.PEDIDOS TO C##LABDATABASE;
GRANT ALL ON C##LABDATABASE.PRODUTOS TO C##LABDATABASE;
GRANT ALL ON C##LABDATABASE.ITENS_PEDIDO TO C##LABDATABASE;

ALTER USER C##LABDATABASE quota unlimited on USERS;
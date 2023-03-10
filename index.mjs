//External modules
import inquirer from "inquirer";
import chalk from "chalk";
//Node core module | internal module
import fs from "fs";

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Despositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action === "Criar conta") {
        createAccount();
      } else if (action === "Despositar") {
        deposit();
      } else if (action === "Consultar saldo") {
        getAccountBalance();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar Accounts!"));
        process.exit();
      }
    })
    .catch((error) => {
      console.warn(error);
    });
}
//account
function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher nosso banco"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        messsage: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info(accountName);
      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.warn(
          chalk.bgRed.black("está conta já exite, escolha outro nome!")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        (error) => {
          console.warn(error);
        }
      );

      console.log(chalk.green("parabéns sua conta foi criada"));
      operation();
    })
    .catch((error) => {
      console.warn(error);
    });
}

//add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      //verify if account exists
      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deaseja depositar",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          //add an amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((error) => console.warn(error));
    })
    .catch((error) => console.warn(error));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black("está conta não existe, escolha outro nome"));
    return false;
  }
  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  if (!amount) {
    console.warn(chalk.bgRed.black("ocorreu um erro, tente novamente!"));
    return deposit();
  }
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (error) => console.warn(error)
  );

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta`)
  );
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
}

//show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      //verify is accounts exists
      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);
      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$ ${accountData.balance}`
        )
      );
      operation();
    })
    .catch((error) => console.warn("error"));
}
//get an amount from user account
function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      if (!checkAccount(accountName)) {
        return withdraw();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          console.log(amount);
          removeAmount(accountName, amount);
        })
        .catch((error) => console.warn(error));
    })
    .catch((error) => console.warn(error));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde")
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("valor indisponível"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (error) => console.warn(error)
  );

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} na sua conta!`)
  );
  operation();
}

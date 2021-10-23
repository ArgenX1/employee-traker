const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const { table } = require('console');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'company'
    },
    console.log('Connected to the company database')
);

const start = () => {
    inquirer.prompt({
        type: 'list',
        name: 'startQuestion',
        message: 'What would you like to do?',
        choices: ['View all departments','View all roles','View all employees','Add a department','Add a role','Add an employee','Update employee role','Quit']
    }).then((data) => {
        switch (data.startQuestion) {
            case 'View all departments':
                viewDepartments();
                
                break;
            case 'View all roles':
                viewRoles();

                break;
            case 'View all employees':
                viewEmployees();

                break;
            case 'Add a department':
                addDepartment();
                
                break;
            case 'Add a role':
                addRole();

                break;
            case 'Add an employee':
                addEmployee();

                break;
            case 'Update employee role':
                updateEmployee();

                break;
            default:
                console.log('Bye!');
                return;
        }
    })
}

const viewDepartments = () => {
    db.query('SELECT * FROM department;', (err, res) => {
        if (err) {
            console.error(err);
        }
        console.log('\n');
        console.table(res);
        start();
    });
}

const viewRoles = () => {
    db.query('SELECT role.id, title, department.name AS department, salary FROM role JOIN department ON role.department_id = department.id;', (err, res) => {
        if(err) {
            console.error(err);
        }
        console.log('\n');
        console.table(res);
        start();
    });
}

const viewEmployees = () => {
    db.query('SELECT T1.id, T1.first_name, T1.last_name, role.title, department.name AS department, role.salary, CONCAT(T2.first_name, " ", T2.last_name) AS manager FROM ((employee T1 LEFT JOIN employee T2 ON T1.manager_id = T2.id) JOIN role ON T1.role_id = role.id) JOIN department ON department_id = department.id;', (err, res) => {
        if(err) {
            console.error(err);
        }
        console.log('\n');
        console.table(res);
        start();
    });
}

const addDepartment = () => {
    inquirer.prompt({
        type: 'input',
        name: 'addDepartment',
        message: 'What is the name of the department?'
    }).then((answer) => {
        db.query('INSERT INTO department (name) VALUES (?)', answer.addDepartment, (err, res) => {
            if(err) {
                console.error(err);
            }
            console.log('\n');
            console.table(res);
            console.log('\nAdded Department to Database');
            start();
        });
    });
}

const addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role?'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of this role?'
        }
    ]).then((role) => {
        db.query('SELECT name FROM department', (err, res) => {
            if (err) {
                console.error(err);
            }
            inquirer.prompt({
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: res.map((department) => department.name)
            }).then((answer) => {
                db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)' [role.name, role.salary, answer.department_id], (err, res) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log('\n');
                    console.table(res);
                    console.log('Added role to database');
                    start();
                });
            });
        });
    });
}

const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first',
            message: 'What is the employees first name?'
        },
        {
            type: 'input',
            name: 'last',
            message: 'What is the employees last name?'
        },
    ]).then((nameAnswer) => {
        const {first, last} = nameAnswer;
        console.log(first);
        db.query('SELECT title, id FROM role', (err,roleRes) => {
            if (err) {
                console.error(err);
            }
            console.log(last);
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is this employees role?',
                    choices: roleRes.map((role) => role.title)
                }
            ]).then((roleAnswer) => {
                const {role} = roleAnswer;
                const roleArray = roleRes.filter((data) => data.title === role) 
                console.log(roleArray);
                const roleId = roleArray[0].id;
                db.query('SELECT first_name, last_name, id FROM employee', (err,employeeRes) => {
                    if (err) {
                        console.error(err);
                    }
                    inquirer.prompt({
                        type: 'list',
                        name: 'manager',
                        message: 'Who is this employees manager?',
                        choices: employeeRes.map((role) => `${role.first_name} ${role.last_name}`)
                    }).then((managerAnswer) => {
                        const {manager} = managerAnswer;
                        const managerId = employeeRes.filter((data) => `${data.first_name} ${data.last_name}` === manager)[0].id;
                        db.query('INSERT INTO employee (first_name, last_name,role_id, manager_id) VALUES (?, ?, ?, ?)', [first, last, roleId, managerId], (err,res) => {
                            if (err) {
                                console.error(err);
                            }
                            console.log('\n');
                            console.log('Added employee to database');
                            start();
                        })
                    })
                })
            })
        })
    });
}

const updateEmployee = () => {
    
}

start();
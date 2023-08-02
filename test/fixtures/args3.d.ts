/**
 * Assign the project to a list of employees.
 *
 * @param employees The employees who are responsible for the project.
 * @param employees[].department The employee's department.
 * @param employees[].name The name of an employee.
 */
export declare function assignProjectAll(employees: Array<{
    /** The employee's department. */
    department: string;
    /** The name of an employee. */
    name: string;
}>): void;

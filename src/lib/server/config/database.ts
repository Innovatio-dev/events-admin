import { Sequelize } from 'sequelize'
// import { init } from './models'
import { init } from '../models'
import { DB_URL } from '$env/static/private'
import pg from 'pg'

let connection: Sequelize | null = null

export async function getConnection() {
	if (connection) {
		return connection as Sequelize
	}

	connection = new Sequelize(DB_URL as string, {
		dialect: 'postgres',
		logging: false,
		dialectModule: pg
	})
	// Initialize db models with the current connection
	init(connection)
	return connection
}

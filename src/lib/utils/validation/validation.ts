import type { Column, SortableColumn } from '$lib/components/SortableTable.svelte'
import type { ObjectSchema } from 'joi'
import type { ValidationError } from 'joi'

export function getErrorMessages(error: ValidationError, path: string | null = null) {
	const messages: string[] = []
	for (const errorItem of error.details) {
		if (!path || errorItem.path.includes(path)) {
			messages.push(errorItem.message)
		}
	}
	return messages
}

export function createUrl(base: URL, params: any) {
	const url = new URL(base)

	for (const key in params) {
		const value = params[key]

		if (value === null) {
			url.searchParams.delete(key)
			continue // Pasar a la siguiente iteración del bucle
		}
		if (Array.isArray(value)) {
			if (value.length) url.searchParams.set(key, value.join(','))
			else url.searchParams.delete(key)
		} else {
			url.searchParams.set(key, value)
		}
	}

	return url
}

export function validateUrlSearchParams(params: URLSearchParams, schema: ObjectSchema) {
	const result: any = {}
	for (const [key, value] of params.entries()) {
		result[key] = value
	}
	const schemaResult = schema.validate(result)
	if (schemaResult.error) {
		throw schema.error
	}
	return schemaResult.value
}

export function mapArrayIntoCollection(arr: [], collection: any[], key: string) {
	const result: any[] = []
	for (const item of arr) {
		const itemInCollection = collection.find((value) => value[key] == item)
		if (itemInCollection) {
			result.push(itemInCollection)
		}
	}
	return result
}

export function mapArrayIntoCollectionOrder(arr: string[], collection: Column[]) {
	const result: SortableColumn[] = []
	for (const value of arr) {
		const orderType = value.startsWith('-') ? 'desc' : 'asc'
		const dataKey = value.substring(orderType == 'asc' ? 0 : 1)
		const column = collection.find((col) => col.dataKey == dataKey)
		if (column) {
			result.push({
				column,
				index: result.length + 1,
				type: orderType
			})
		}
	}
	return result
}

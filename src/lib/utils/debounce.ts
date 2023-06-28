export function createDebouncer(fn, delay) {
	let timeoutId
	return {
		cancel: () => {
			clearTimeout(timeoutId)
		},
		debounce: function (...args) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				fn.apply(this, args)
			}, delay)
		}
	}
}

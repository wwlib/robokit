
export const INTERVAL = 10 * 60 * 1000;

export const DELAY = 1000;

export const REPEAT = 10;

export const NOW = Date.now.bind(Date);

export const SYNC_CALLBACK = (err) => {
	if(err) {
		throw err;
	}
}

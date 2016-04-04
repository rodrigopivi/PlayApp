/**
 * repeats a call to a Fn `N` times
 * e.g.: `times(3)(() => console.log('Yay!'))`
 */
export const repeat: (n: number) => (f: Function) => void = (n) => {
  return (f: Function) => {
    [...Array(n)].map(() => f())
  }
}

/**
 * repeats an async fn that will set a timeout of n milliseconds before resolving
 * e.g.: `await delay(100)`
 */
export async function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds)
    })
}

/**
 * Generator for looping object entries
 * e.g.: `eachValuesOf(myObj, (val) => { ... })`
 */
export function eachValuesOf(obj: any, cb: (val) => any): void {
   for (let key of Object.keys(obj)) {
     cb(obj[key])
   }
}

/**
 * Generates a random alhpa numeric string of the provided length
 * e.g.: `getRandomAlphaString(8)`
 */
export function getRandomAlphaString(length: number) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = '';
    for (let i = length; i > 0; --i)  { result += chars[Math.floor(Math.random() * chars.length)] }
    return result;
}

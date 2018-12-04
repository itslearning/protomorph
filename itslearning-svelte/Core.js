export function Initialize() {
    Object.assign(String.prototype, {
        format(...args) {
            let result = this.toString();

            for (let idx = 0; idx < args.length; idx++) {
                result = result.replace(`{${idx}}`, args[idx]);
            }

            return result;
        }
    });
}

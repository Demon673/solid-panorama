// Based on https://github.com/browserify/node-util/blob/4b1c0c79790d9968eabecd2e9c786454713e200f/util.js#L33
export function format(value?: unknown, ...substitutions: unknown[]) {
    if (typeof value !== 'string') {
        return [value, ...substitutions].map(v => inspect(v)).join(' ');
    }

    let count = 0;
    let result = String(value).replace(/%[sdj%]/g, x => {
        count++;
        if (x === '%%') return '%';
        if (substitutions.length === 0) return x;

        switch (x) {
            case '%s':
                return String(substitutions.shift());

            case '%d':
                return String(Number(substitutions.shift()));

            case '%j':
                try {
                    return JSON.stringify(substitutions.shift());
                } catch {
                    return '[Circular]';
                }

            default:
                return x;
        }
    });

    for (const x of substitutions) {
        if (typeof x !== 'object' || x === null) {
            result += ` ${x}`;
        } else {
            result += ` ${inspect(x)}`;
        }
    }

    return result;
}

export function formatx(value?: unknown, ...substitutions: unknown[]) {
    if (typeof value !== 'string') {
        return [value, ...substitutions].map(v => inspect(v, true)).join(' ');
    }

    let result = String(value).replace(/%[sdj%]/g, x => {
        if (x === '%%') return '%';
        if (substitutions.length === 0) return x;

        switch (x) {
            case '%s':
                return String(substitutions.unshift());

            case '%d':
                return String(Number(substitutions.unshift()));

            case '%j':
                try {
                    return JSON.stringify(substitutions.unshift());
                } catch {
                    return '[Circular]';
                }

            default:
                return x;
        }
    });

    for (const x of substitutions) {
        if (typeof x !== 'object' || x === null) {
            result += ` ${x}`;
        } else {
            result += ` ${inspect(x)}`;
        }
    }

    return result;
}

function inspect(value: unknown, expand?: boolean, tab = '') {
    let result = '';
    if (typeof value === 'string') {
        result = `"${value}"`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        result = `${value}`;
    } else if (typeof value === 'function') {
        result = `[Function]`;
    } else if (typeof value === 'symbol') {
        result = value.toString();
    } else if (typeof value === 'undefined') {
        result = `undefined`;
    } else if (typeof value === 'bigint') {
        result = `[bigint ${value.toString()}]`;
    } else if (typeof value === 'object') {
        if (value === null) {
            result = 'null';
        } else if (Array.isArray(value)) {
            let list = [];
            for (const v of value) {
                list.push(
                    tab + inspect(v, expand, expand ? tab + '    ' : tab)
                );
            }
            if (expand) {
                result += '[\n';
                result += list.map(v => '    ' + v).join(',\n');
                result += '\n' + tab + ']';
            } else {
                result = `[ ${list.join(', ')} ]`;
            }
        } else {
            let list = [];
            for (const [k, v] of Object.entries(value)) {
                if (k === 'style' && isPanelBase(v)) {
                    list.push(`${tab}${k}: [VCSSStyleDeclaration]`);
                    continue;
                }
                list.push(
                    `${tab}${k}: ${inspect(
                        v,
                        expand,
                        expand ? tab + '    ' : tab
                    )}`
                );
            }
            if (expand) {
                result += '{\n';
                result += list.map(v => '    ' + v).join(',\n');
                result += '\n' + tab + '}';
            } else {
                result = `{ ${list.join(', ')} }`;
            }
        }
    }
    return result;
}

const isPanelBase = (value: object): value is PanelBase =>
    'paneltype' in value &&
    'rememberchildfocus' in value &&
    'SetPanelEvent' in value &&
    'RunScriptInPanelContext' in value;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@heroku-cli/command");
const cli_ux_1 = require("cli-ux");
class Whoami extends command_1.Command {
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (process.env.HEROKU_API_KEY)
                cli_ux_1.default.warn('HEROKU_API_KEY is set');
            if (!this.heroku.defaultOptions.headers.authorization)
                this.notloggedin();
            try {
                let { body: account } = yield this.heroku.get('/account');
                cli_ux_1.default.log(account.email);
            }
            catch (err) {
                if (err.http.statusCode === 401)
                    this.notloggedin();
                throw err;
            }
        });
    }
    notloggedin() {
        cli_ux_1.default.error('not logged in', { exitCode: 100 });
    }
}
Whoami.topic = 'auth';
Whoami.command = 'whoami';
Whoami.description = 'display the current logged in user';
Whoami.aliases = ['whoami'];
exports.default = Whoami;

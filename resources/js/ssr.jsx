/* prettier-ignore */
import {
createInertiaApp
} from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { route } from 'ziggy-js';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', {
                eager: true,
            });
            return pages[`./pages/${name}.tsx`];
        },
        // prettier-ignore
        setup: ({ App, props }) => {
            const ziggyConfig = props.initialPage.props.ziggy;
            global.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...ziggyConfig,
                    location: new URL(ziggyConfig.location),
                });

            return <App {...props} />;
        },
    }),
);

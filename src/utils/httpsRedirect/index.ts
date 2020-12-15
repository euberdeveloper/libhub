/**
 * A middleware that redirects the http to an https
 * @param req 
 * @param res 
 * @param next 
 */
export function httpsRedirect(req, res, next) {
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    }
    else {
        next();
    }
}
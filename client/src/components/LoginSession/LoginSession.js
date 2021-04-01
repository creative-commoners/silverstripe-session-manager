/* global ss */
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import confirm from '@silverstripe/reactstrap-confirm';
import Button from 'components/Button/Button';

function LoginSession(props) {
    // This is an async function because 'confirm' requires it
    // https://www.npmjs.com/package/@silverstripe/reactstrap-confirm
    async function attemptLogOut() {
        if (props.submitting) {
            return;
        }
        // Confirm with the user
        const confirmMessage = i18n._t(
            'SessionManager.DELETE_CONFIRMATION',
            'Are you sure you want to delete this login session?'
        );
        const confirmTitle = i18n._t('SessionManager.CONFIRMATION_TITLE', 'Are you sure?');
        const buttonLabel = i18n._t('SessionManager.DELETE_CONFIRMATION_BUTTON', 'Remove login session');
        if (!await confirm(confirmMessage, { title: confirmTitle, confirmLabel: buttonLabel })) {
            return;
        }
        props.logout();
    }

    moment.locale(ss.i18n.currentLocale);
    const format = 'L LT';
    const created = moment.utc(props.Created).local();
    const createdElapsed = created.fromNow();
    const lastAccessed = moment.utc(props.LastAccessed).local();
    const lastAccessedElapsed = lastAccessed.fromNow();
    const currentStr = i18n._t('SessionManager.CURRENT', 'Current');
    const lastActiveStr = props.IsCurrent ?
        i18n.inject(
            i18n._t('SessionManager.AUTHENTICATED', 'authenticated {createdElapsed}...'),
            { createdElapsed }
        )
        : i18n.inject(
            i18n._t('SessionManager.LAST_ACTIVE', 'last active {lastAccessedElapsed}...'),
            { lastAccessedElapsed }
        );
    const logOutStr = (props.submitting || (props.complete && !props.failed)) ?
        i18n._t('SessionManager.LOGGING_OUT', 'Logging out...')
        : i18n._t('SessionManager.LOG_OUT', 'Log out');

    const activityTooltip = i18n.inject(
        i18n._t('Admin.ACTIVITY_TOOLTIP_TEXT', 'Signed in {signedIn}, Last active {lastActive}'),
        {
            signedIn: created.format(format),
            lastActive: lastAccessed.format(format)
        }
    );

    return (
      <div className={`login-session ${(props.complete && !props.failed) ? 'hidden' : ''}`}>
        <p>{props.UserAgent}</p>
        <p className="text-muted">
          {props.IPAddress}
          <span data-toggle="tooltip" data-placement="top" title={activityTooltip}>
            , {lastActiveStr}
          </span>
        </p>
        <p>
          {props.IsCurrent &&
            <strong className="text-success">{currentStr}</strong>
          }
          {!props.IsCurrent && <Button
            color="link"
            className="login-session__logout"
            onClick={() => attemptLogOut()}
          >{logOutStr}</Button>}
        </p>
      </div>
    );
}

LoginSession.propTypes = {
    IPAddress: PropTypes.string.isRequired,
    IsCurrent: PropTypes.bool,
    UserAgent: PropTypes.string,
    Created: PropTypes.string.isRequired,
    LastAccessed: PropTypes.string.isRequired,
    submitting: PropTypes.bool.isRequired,
    complete: PropTypes.bool.isRequired,
    failed: PropTypes.bool.isRequired,
};

export default LoginSession;

/* global jest, jasmine, describe, it, expect, beforeEach, Event, global */

import React from 'react';
import { Component as LoginSessionContainer } from '../LoginSessionContainer';
import LoginSession from '../LoginSession';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockDate from 'mockdate';

// use the jest global variable to set the value inside jest mock of lib/Backend which is
// unable to access regular variable inside its scope
global.success = undefined;

function setEndpointFetcherSuccess(success) {
    global.success = success;
}

let httpResolve;
let httpReject;

// {
//     error: false,
//     success: global.success,
//     message: 'message'
// }

jest.mock('lib/Backend', () => ({
    createEndpointFetcher: () => () => (
        new Promise((resolve, reject) => {
            httpResolve = resolve;
            httpReject = reject;
        })
    )
}));

Enzyme.configure({ adapter: new Adapter() });

window.ss.config = {
    SecurityID: 1234567890
};

const sessionData = {
    IPAddress: '127.0.0.1',
    IsCurrent: false,
    UserAgent: 'Chrome on Mac OS X 10.15.7',
    Created: '2021-01-20 00:33:41',
    LastAccessed: '2021-03-11 03:47:22'
};

const props = {
    // used in LoginSessionContainer
    ID: 1,
    LogOutEndpoint: '/test',
    displayToastSuccess: jest.fn(() => 1),
    displayToastFailure: jest.fn(() => 1),
    // passed on to LoginSession
    ...sessionData
};

MockDate.set('2021-03-12 03:47:22');

describe('LoginSessionContainer', () => {
    beforeEach(() => {
        props.displayToastSuccess.mockClear();
        props.displayToastFailure.mockClear();
    });

    it('should call displayToastSuccess on success', async () => {
        setEndpointFetcherSuccess(true);
        let wrapper = shallow(<LoginSessionContainer {...props} />);
        let loginSession = wrapper.find(LoginSession).first();

        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: false,
            failed: false,
            submitting: false
        });

        const logoutRequest = loginSession.props().logout();

        wrapper = wrapper.update();
        loginSession = wrapper.find(LoginSession).first();
        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: false,
            failed: false,
            submitting: true
        });

        httpResolve({
            error: false,
            success: global.success,
            message: 'amazing success'
        });
        await logoutRequest;

        wrapper = wrapper.update();
        loginSession = wrapper.find(LoginSession).first();
        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: true,
            failed: false,
            submitting: false
        });

        expect(props.displayToastSuccess).toBeCalledWith('amazing success');
        expect(props.displayToastFailure).not.toBeCalled();
    });

    it('should call displayToastFailure on failure', async () => {
        setEndpointFetcherSuccess(false);
        let wrapper = shallow(<LoginSessionContainer {...props} />);
        let loginSession = wrapper.find(LoginSession).first();

        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: false,
            failed: false,
            submitting: false
        });

        const logoutRequest = loginSession.props().logout();

        wrapper = wrapper.update();
        loginSession = wrapper.find(LoginSession).first();
        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: false,
            failed: false,
            submitting: true
        });

        httpResolve({
            error: true,
            success: global.success,
            message: 'horrible failure'
        });
        await logoutRequest;

        wrapper = wrapper.update();
        loginSession = wrapper.find(LoginSession).first();
        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: true,
            failed: true,
            submitting: false
        });

        expect(props.displayToastFailure).toBeCalledWith('horrible failure');
        expect(props.displayToastSuccess).not.toBeCalled();
    });

    it('Handles HTTP Request failure', async () => {
        let wrapper = shallow(<LoginSessionContainer {...props} />);
        let loginSession = wrapper.find(LoginSession).first();

        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: false,
            failed: false,
            submitting: false
        });

        const logoutRequest = loginSession.props().logout();

        wrapper = wrapper.update();
        loginSession = wrapper.find(LoginSession).first();
        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: false,
            failed: false,
            submitting: true
        });

        httpReject();
        await logoutRequest;

        wrapper = wrapper.update();
        loginSession = wrapper.find(LoginSession).first();
        expect(loginSession.props()).toMatchObject({
            ...sessionData,
            complete: true,
            failed: true,
            submitting: false
        });

        expect(props.displayToastFailure).toBeCalledWith('Could not log out of session. Try again later.');
        expect(props.displayToastSuccess).not.toBeCalled();
    });
});

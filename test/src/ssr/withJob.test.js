/* @flow */

import React from 'react';
import { mount } from 'enzyme';
import { Foo, resolveAfter, rejectAfter, warningsAsErrors } from '../../helpers';
import { withJob } from '../../../src/ssr';
import ClientProvider from '../../../src/ssr/ClientProvider';

describe('ssr/withJob()', () => {
  warningsAsErrors();

  describe('higher order component', () => {
    const hoc = withJob(() => resolveAfter(1));
    const Actual = hoc(Foo);

    it('should return a renderable component', () => {
      expect(() =>
        mount(<ClientProvider><Actual /></ClientProvider>),
      ).not.toThrowError();
    });

    it('should throw when the client provider is not set', () => {
      expect(() =>
        mount(<Actual />),
      ).toThrowError();
    });
  });

  describe('rendering', () => {
    it('should not pass down internal props', () => {
      let actual = {};
      const Bob = (props) => {
        actual = props;
        return <div>bob</div>;
      };
      const BobWithJob = withJob(() => true)(Bob);
      const expected = {
        foo: 'foo',
        bar: 'bar',
        job: {},
      };
      mount(<ClientProvider><BobWithJob {...expected} /></ClientProvider>);
      const actualProps = Object.keys(actual);
      expect(actualProps.length).toEqual(3);
      expect(actualProps).toContain('foo');
      expect(actualProps).toContain('bar');
      expect(actualProps).toContain('job');
    });

    it('should provide the expected initial state for a defer', () => {
      let actual = {};
      const Bob = (props) => {
        // eslint-disable-next-line
        actual = props.job;
        return <div>bob</div>;
      };
      const BobWithJob = withJob(() => true)(Bob, { defer: true });
      const expected = {
        inProgress: false,
        completed: true,
      };
      mount(<ClientProvider><BobWithJob {...expected} /></ClientProvider>);
      expect(actual).toMatchObject(expected);
    });
  });
});
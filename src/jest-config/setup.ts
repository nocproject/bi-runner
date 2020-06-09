delete global.Reflect;

import 'core-js/es/reflect';
import 'core-js/proposals/reflect-metadata';

import 'jest-preset-angular';
import './globalMocks';

Object.defineProperty(global, 'Promise', { writable: false, value: global.Promise });

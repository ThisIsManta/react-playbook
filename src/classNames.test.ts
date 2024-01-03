import { it, expect } from 'vitest'
import classNames from './classNames'

it('returns an empty string, given non string inputs', () => {
	expect(classNames(true)).toBe('')
	expect(classNames(false)).toBe('')
	expect(classNames(undefined)).toBe('')
	expect(classNames(null)).toBe('')
	expect(classNames({} as any)).toBe('')
})

it('returns an empty string, given empty string inputs', () => {
	expect(classNames('')).toBe('')
	expect(classNames('   ')).toBe('')
})

it('returns the given string in normalized form, given valid string inputs', () => {
	expect(classNames('c1')).toBe('c1')
	expect(classNames(' c1   c2 ', ' c3 ')).toBe('c1 c2 c3')
})
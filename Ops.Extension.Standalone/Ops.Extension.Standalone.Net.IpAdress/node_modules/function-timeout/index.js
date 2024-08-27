import vm from 'node:vm';

export default function functionTimeout(function_, {timeout} = {}) {
	const script = new vm.Script('returnValue = function_()');

	const wrappedFunction = (...arguments_) => {
		const context = {
			function_: () => function_(...arguments_),
		};

		script.runInNewContext(context, {timeout});

		return context.returnValue;
	};

	Object.defineProperty(wrappedFunction, 'name', {
		value: `functionTimeout(${function_.name || '<anonymous>'})`,
		configurable: true,
	});

	return wrappedFunction;
}

export function isTimeoutError(error) {
	return error?.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT';
}

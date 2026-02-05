(function() {
    'use strict';

    // Calculator state
    let tokens = [];
    let currentValue = '';
    let justCalculated = false;
    let isRadians = true;

    // DOM elements
    let display;
    let toast;
    let displaySwipe;
    let angleToggle;
    const maxDigits = 8;
    let toastTimer = null;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeActive = false;
    let isSciMode = false;

    const functionTokens = ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'abs', 'inv'];

    // Update the display
    function formatOperator(op) {
        switch (op) {
            case '+':
                return '+';
            case '-':
                return '−';
            case '*':
                return '×';
            case '/':
                return '÷';
            case '^':
                return '^';
            default:
                return '';
        }
    }

    function isOperator(token) {
        return token === '+' || token === '-' || token === '*' || token === '/' || token === '^';
    }

    function isFunctionToken(token) {
        return functionTokens.includes(token);
    }

    function isConstant(token) {
        return token === 'pi' || token === 'e';
    }

    function isNumericToken(token) {
        return token !== undefined && token !== '' && !isNaN(parseFloat(token));
    }

    function isValueToken(token) {
        return isNumericToken(token) || isConstant(token) || token === ')';
    }

    function formatToken(token) {
        if (token === 'pi') return 'π';
        if (token === 'e') return 'e';
        if (token === 'sqrt') return '√';
        if (token === 'inv') return '1/x';
        return token;
    }

    function getParenBalance() {
        let balance = 0;
        tokens.forEach(token => {
            if (token === '(') balance += 1;
            if (token === ')') balance -= 1;
        });
        return balance;
    }

    function updateDisplay() {
        let displayText = '';
        const lastToken = tokens[tokens.length - 1];
        const showDivisionError = lastToken === '/' && currentValue === '0' && currentValue !== '';

        tokens.forEach((token, index) => {
            if (isOperator(token)) {
                const isLast = index === tokens.length - 1;
                const isError = isLast && showDivisionError && token === '/';
                displayText += `<span class="op${isError ? ' is-error' : ''}">${formatOperator(token)}</span>`;
            } else if (isFunctionToken(token)) {
                displayText += formatToken(token);
            } else if (isConstant(token)) {
                displayText += formatToken(token);
            } else {
                displayText += formatToken(token);
            }
        });

        if (currentValue !== '') {
            const valueClass = justCalculated && tokens.length === 0 ? 'value underline result' : 'value underline';
            displayText += `<span class="${valueClass}">${currentValue}</span>`;
        }

        display.innerHTML = `${displayText}<span class="caret"></span>`;

        const rawLength = displayText.replace(/<[^>]+>/g, '').length;
        if (rawLength > 10) {
            display.style.fontSize = '24px';
        } else if (rawLength > 8) {
            display.style.fontSize = '30px';
        } else {
            display.style.fontSize = '';
        }
    }

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 1200);
    }

    // Handle number input
    function handleNumber(num) {
        if (justCalculated && tokens.length === 0) {
            currentValue = '';
            justCalculated = false;
        }

        if (num === '.') {
            if (currentValue.includes('.')) return;
            currentValue = currentValue === '' ? '0.' : currentValue + num;
        } else {
            const digitCount = currentValue.replace(/\D/g, '').length;
            if (digitCount >= maxDigits) {
                showToast("Can't enter more than 8 digits.");
                return;
            }
            const lastToken = tokens[tokens.length - 1];
            if (currentValue === '' && isValueToken(lastToken)) {
                tokens.push('*');
            }
            currentValue = currentValue === '' ? num : currentValue + num;
        }

        updateDisplay();
    }

    // Handle operator input
    function handleOperator(nextOperator) {
        if (currentValue !== '') {
            tokens.push(currentValue);
            currentValue = '';
        } else if (tokens.length === 0) {
            return;
        }

        const lastToken = tokens[tokens.length - 1];
        if (isOperator(lastToken)) {
            tokens[tokens.length - 1] = nextOperator;
        } else if (lastToken === '(' || isFunctionToken(lastToken)) {
            return;
        } else {
            tokens.push(nextOperator);
        }

        justCalculated = false;
        updateDisplay();
    }

    // Perform calculation
    function calculateExpression(expressionTokens) {
        const output = [];
        const ops = [];
        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3
        };
        const rightAssociative = {
            '^': true
        };

        expressionTokens.forEach(token => {
            if (isNumericToken(token) || isConstant(token)) {
                if (token === 'pi') {
                    output.push(String(Math.PI));
                } else if (token === 'e') {
                    output.push(String(Math.E));
                } else {
                    output.push(token);
                }
            } else if (isFunctionToken(token)) {
                ops.push(token);
            } else if (isOperator(token)) {
                while (
                    ops.length &&
                    (isFunctionToken(ops[ops.length - 1]) ||
                        (isOperator(ops[ops.length - 1]) &&
                            ((rightAssociative[token] && precedence[ops[ops.length - 1]] > precedence[token]) ||
                                (!rightAssociative[token] && precedence[ops[ops.length - 1]] >= precedence[token]))))
                ) {
                    output.push(ops.pop());
                }
                ops.push(token);
            } else if (token === '(') {
                ops.push(token);
            } else if (token === ')') {
                while (ops.length && ops[ops.length - 1] !== '(') {
                    output.push(ops.pop());
                }
                ops.pop();
                if (ops.length && isFunctionToken(ops[ops.length - 1])) {
                    output.push(ops.pop());
                }
            }
        });

        while (ops.length) {
            output.push(ops.pop());
        }

        const stack = [];
        output.forEach(token => {
            if (!isNaN(parseFloat(token))) {
                stack.push(parseFloat(token));
            } else if (isFunctionToken(token)) {
                const value = stack.pop();
                if (value === undefined) return;
                let result;
                switch (token) {
                    case 'sin':
                        result = Math.sin(isRadians ? value : (value * Math.PI) / 180);
                        break;
                    case 'cos':
                        result = Math.cos(isRadians ? value : (value * Math.PI) / 180);
                        break;
                    case 'tan':
                        result = Math.tan(isRadians ? value : (value * Math.PI) / 180);
                        break;
                    case 'ln':
                        result = Math.log(value);
                        break;
                    case 'log':
                        result = Math.log10 ? Math.log10(value) : Math.log(value) / Math.LN10;
                        break;
                    case 'sqrt':
                        result = Math.sqrt(value);
                        break;
                    case 'abs':
                        result = Math.abs(value);
                        break;
                    case 'inv':
                        result = 1 / value;
                        break;
                    default:
                        result = value;
                }
                stack.push(result);
            } else if (isOperator(token)) {
                const b = stack.pop();
                const a = stack.pop();
                if (a === undefined || b === undefined) return;
                let result;
                switch (token) {
                    case '+':
                        result = a + b;
                        break;
                    case '-':
                        result = a - b;
                        break;
                    case '*':
                        result = a * b;
                        break;
                    case '/':
                        result = a / b;
                        break;
                    case '^':
                        result = Math.pow(a, b);
                        break;
                    default:
                        result = b;
                }
                stack.push(result);
            }
        });

        let result = stack.pop();
        if (!isFinite(result)) {
            return 'Error';
        }

        result = Math.round(result * 1000000000) / 1000000000;
        let resultStr = String(result);
        if (resultStr.length > 12) {
            if (result >= 1e12 || result <= -1e12) {
                resultStr = result.toExponential(5);
            } else {
                resultStr = resultStr.slice(0, 12);
            }
        }

        return resultStr;
    }

    // Handle equals
    function handleEquals() {
        const expressionTokens = tokens.slice();
        if (currentValue !== '') {
            expressionTokens.push(currentValue);
        }

        if (expressionTokens.length === 0) return;

        while (expressionTokens.length) {
            const lastToken = expressionTokens[expressionTokens.length - 1];
            if (isOperator(lastToken) || lastToken === '(' || isFunctionToken(lastToken)) {
                expressionTokens.pop();
            } else {
                break;
            }
        }

        let balance = 0;
        expressionTokens.forEach(token => {
            if (token === '(') balance += 1;
            if (token === ')') balance -= 1;
        });
        while (balance > 0) {
            expressionTokens.push(')');
            balance -= 1;
        }

        const result = calculateExpression(expressionTokens);
        tokens = [];
        currentValue = String(result);
        justCalculated = true;
        updateDisplay();
    }

    // Handle clear
    function handleClear() {
        tokens = [];
        currentValue = '';
        justCalculated = false;
        updateDisplay();
    }

    // Handle backspace
    function handleBackspace() {
        justCalculated = false;
        if (currentValue !== '') {
            currentValue = currentValue.slice(0, -1);
            updateDisplay();
            return;
        }

        if (tokens.length === 0) return;

        const lastToken = tokens.pop();
        if (lastToken === '(' && tokens.length && isFunctionToken(tokens[tokens.length - 1])) {
            tokens.pop();
        } else if (lastToken && !isOperator(lastToken) && lastToken !== '(' && lastToken !== ')' && !isFunctionToken(lastToken) && !isConstant(lastToken)) {
            currentValue = lastToken.slice(0, -1);
        }
        updateDisplay();
    }

    function handleSwipeStart(event) {
        const point = event.touches ? event.touches[0] : event;
        swipeStartX = point.clientX;
        swipeStartY = point.clientY;
        swipeActive = true;
    }

    function handleSwipeEnd(event) {
        if (!swipeActive) return;
        swipeActive = false;
        const point = event.changedTouches ? event.changedTouches[0] : event;
        const deltaX = point.clientX - swipeStartX;
        const deltaY = point.clientY - swipeStartY;
        if (deltaX > 30 && Math.abs(deltaY) < 30) {
            handleBackspace();
        }
    }

    function handleParen() {
        const balance = getParenBalance();
        const lastToken = tokens[tokens.length - 1];
        const canClose = balance > 0 && (currentValue !== '' || lastToken === ')');

        if (canClose) {
            if (currentValue !== '') {
                tokens.push(currentValue);
                currentValue = '';
            }
            tokens.push(')');
        } else {
            if (currentValue !== '') {
                tokens.push(currentValue);
                currentValue = '';
                tokens.push('*');
            } else if (lastToken && !isOperator(lastToken) && lastToken !== '(') {
                tokens.push('*');
            }
            tokens.push('(');
        }

        justCalculated = false;
        updateDisplay();
    }

    function handleFunction(funcName) {
        if (justCalculated && tokens.length === 0) {
            currentValue = '';
            justCalculated = false;
        }

        if (currentValue !== '') {
            tokens.push(currentValue);
            currentValue = '';
            tokens.push('*');
        } else if (isValueToken(tokens[tokens.length - 1])) {
            tokens.push('*');
        }

        tokens.push(funcName);
        tokens.push('(');
        updateDisplay();
    }

    function handleConstant(constName) {
        if (justCalculated && tokens.length === 0) {
            currentValue = '';
            justCalculated = false;
        }

        if (currentValue !== '') {
            tokens.push(currentValue);
            currentValue = '';
            tokens.push('*');
        } else if (isValueToken(tokens[tokens.length - 1])) {
            tokens.push('*');
        }

        tokens.push(constName);
        updateDisplay();
    }

    function handlePower() {
        if (currentValue !== '') {
            tokens.push(currentValue);
            currentValue = '';
        } else if (!isValueToken(tokens[tokens.length - 1])) {
            return;
        }
        tokens.push('^');
        updateDisplay();
    }

    function handlePowerTwo() {
        if (currentValue !== '') {
            tokens.push(currentValue);
            currentValue = '';
        } else if (!isValueToken(tokens[tokens.length - 1])) {
            return;
        }
        tokens.push('^');
        tokens.push('2');
        updateDisplay();
    }

    function handleExp() {
        if (currentValue !== '') {
            tokens.push(currentValue);
            currentValue = '';
            tokens.push('*');
        } else if (isValueToken(tokens[tokens.length - 1])) {
            tokens.push('*');
        }
        tokens.push('e');
        tokens.push('^');
        updateDisplay();
    }

    function toggleAngleMode() {
        isRadians = !isRadians;
        if (angleToggle) {
            angleToggle.textContent = isRadians ? 'Rad' : 'Deg';
            angleToggle.classList.toggle('is-active', !isRadians);
        }
    }

    function toggleSciMode() {
        isSciMode = !isSciMode;
        const container = document.querySelector('.calculator-container');
        if (container) {
            container.classList.toggle('is-sci', isSciMode);
        }
    }

    // Initialize event listeners
    function init() {
        display = document.getElementById('display');
        toast = document.getElementById('toast');
        displaySwipe = document.getElementById('display-swipe');
        angleToggle = document.getElementById('angle-toggle');

        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', function() {
                handleNumber(this.dataset.number);
            });
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(button => {
            button.addEventListener('click', function() {
                handleOperator(this.dataset.operator);
            });
        });

        // Action buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action;
                switch (action) {
                    case 'clear':
                        handleClear();
                        break;
                    case 'backspace':
                        handleBackspace();
                        break;
                    case 'equals':
                        handleEquals();
                        break;
                    case 'paren':
                        handleParen();
                        break;
                    case 'more':
                        toggleSciMode();
                        break;
                    case 'toggle-angle':
                        toggleAngleMode();
                        break;
                    case 'pow':
                        handlePower();
                        break;
                    case 'pow2':
                        handlePowerTwo();
                        break;
                    case 'exp':
                        handleExp();
                        break;
                }
            });
        });

        document.querySelectorAll('[data-func]').forEach(button => {
            button.addEventListener('click', function() {
                handleFunction(this.dataset.func);
            });
        });

        document.querySelectorAll('[data-const]').forEach(button => {
            button.addEventListener('click', function() {
                handleConstant(this.dataset.const);
            });
        });

        const swipeTarget = displaySwipe || display;
        if (swipeTarget) {
            swipeTarget.addEventListener('touchstart', handleSwipeStart, { passive: true });
            swipeTarget.addEventListener('touchend', handleSwipeEnd, { passive: true });
        }

        // Tizen hardware back key support
        document.addEventListener('tizenhwkey', function(e) {
            if (e.keyName === "back") {
                try {
                    tizen.application.getCurrentApplication().exit();
                } catch (ignore) {}
            }
        });

        // Initial display update
        updateDisplay();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

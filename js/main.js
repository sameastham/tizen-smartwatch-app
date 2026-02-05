(function() {
    'use strict';

    // Calculator state
    let currentValue = '0';
    let previousValue = '';
    let operator = null;
    let waitingForOperand = false;

    // DOM elements
    let display;
    let displayMeta;
    let activeOperatorButton = null;

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
            default:
                return '';
        }
    }

    function updateDisplay() {
        display.textContent = currentValue;
        if (displayMeta) {
            if (operator && previousValue !== '') {
                displayMeta.textContent = `${previousValue} ${formatOperator(operator)}`;
            } else {
                displayMeta.textContent = '';
            }
        }

        // Adjust font size for long numbers
        if (currentValue.length > 8) {
            display.style.fontSize = '24px';
        } else if (currentValue.length > 6) {
            display.style.fontSize = '32px';
        } else {
            display.style.fontSize = '';
        }
    }

    // Handle number input
    function handleNumber(num) {
        if (waitingForOperand) {
            currentValue = num === '.' ? '0.' : num;
            waitingForOperand = false;
        } else {
            // Handle decimal point
            if (num === '.') {
                if (currentValue.includes('.')) return;
                currentValue += num;
            } else {
                // Replace initial 0, but not for decimals
                currentValue = currentValue === '0' ? num : currentValue + num;
            }
        }

        // Limit display length
        if (currentValue.length > 12) {
            currentValue = currentValue.slice(0, 12);
        }

        updateDisplay();
    }

    // Handle operator input
    function handleOperator(nextOperator) {
        const inputValue = parseFloat(currentValue);

        if (operator && !waitingForOperand) {
            const result = calculate();
            currentValue = String(result);
            updateDisplay();
        }

        previousValue = currentValue;
        operator = nextOperator;
        waitingForOperand = true;
    }

    // Perform calculation
    function calculate() {
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);

        if (isNaN(prev) || isNaN(current)) return current;

        let result;
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
            default:
                return current;
        }

        // Handle division by zero
        if (!isFinite(result)) {
            return 'Error';
        }

        // Round to avoid floating point issues
        result = Math.round(result * 1000000000) / 1000000000;

        // Format result
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
        if (!operator) return;

        const result = calculate();
        currentValue = String(result);
        previousValue = '';
        operator = null;
        waitingForOperand = true;
        setActiveOperatorButton(null);
        updateDisplay();
    }

    // Handle clear
    function handleClear() {
        currentValue = '0';
        previousValue = '';
        operator = null;
        waitingForOperand = false;
        setActiveOperatorButton(null);
        updateDisplay();
    }

    // Handle backspace
    function handleBackspace() {
        if (waitingForOperand) return;

        if (currentValue.length === 1 || (currentValue.length === 2 && currentValue[0] === '-')) {
            currentValue = '0';
        } else {
            currentValue = currentValue.slice(0, -1);
        }
        updateDisplay();
    }

    function setActiveOperatorButton(button) {
        if (activeOperatorButton) {
            activeOperatorButton.classList.remove('is-active');
        }
        activeOperatorButton = button;
        if (activeOperatorButton) {
            activeOperatorButton.classList.add('is-active');
        }
    }

    // Initialize event listeners
    function init() {
        display = document.getElementById('display');
        displayMeta = document.getElementById('display-meta');

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
                setActiveOperatorButton(this);
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
                }
            });
        });

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

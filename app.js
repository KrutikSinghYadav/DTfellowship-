let treeData = null;
let nodesMap = {};
let currentNodeId = 'START';
let answers = {};
let signals = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('reflection-tree.json')
        .then(response => response.json())
        .then(data => {
            treeData = data;
            data.nodes.forEach(node => {
                nodesMap[node.id] = node;
            });
            renderNode();
        })
        .catch(error => {
            document.getElementById('content-container').innerHTML = `<p style="color:red;">Error loading tree. Make sure you are running a local server (e.g. python -m http.server).</p>`;
            console.error(error);
        });
});

function interpolate(text) {
    if (!text) return "";
    return text.replace(/\{([A-Za-z0-9_]+)\.answer\}/g, (match, p1) => {
        return answers[p1] || "";
    });
}

function evaluateCondition(cond) {
    if (cond === 'default') return true;
    
    let jsCond = cond.replace(/\band\b/g, '&&');
    
    const ctx = {
        answers: answers,
        signals: new Proxy(signals, {
            get: (target, prop) => {
                if (!(prop in target)) {
                    return new Proxy({}, { get: () => 0 });
                }
                return new Proxy(target[prop], {
                    get: (t, p) => (p in t) ? t[p] : 0
                });
            }
        })
    };

    try {
        const func = new Function('answers', 'signals', `return ${jsCond};`);
        return func(ctx.answers, ctx.signals);
    } catch (e) {
        console.error("Eval error:", e, cond);
        return false;
    }
}

function processDecisionNode(node) {
    for (let rule of node.rules) {
        if (evaluateCondition(rule.condition)) {
            currentNodeId = rule.target;
            renderNode();
            return;
        }
    }
    console.error("Dead end at decision node", node.id);
}

function renderNode() {
    const container = document.getElementById('content-container');
    container.innerHTML = ''; 
    
    const node = nodesMap[currentNodeId];
    if (!node) {
        container.innerHTML = '<p>End of reflection.</p>';
        return;
    }

    container.classList.remove('fade-in');
    void container.offsetWidth; 
    container.classList.add('fade-in');

    if (node.type === 'decision') {
        processDecisionNode(node);
        return;
    }

    const text = interpolate(node.text);
    let html = '';
    
    if (node.type === 'start') {
        html += `<div class="tag">Daily Reflection</div>`;
        html += `<h1 class="node-title">${text}</h1>`;
        html += `<div class="options-container">
                    <button class="primary" onclick="advance('${node.target}')">Begin</button>
                 </div>`;
    } 
    else if (node.type === 'question') {
        html += `<p class="node-text">${text}</p>`;
        html += `<div class="options-container">`;
        node.options.forEach((opt, idx) => {
            html += `<button onclick="selectOption('${node.id}', ${idx}, '${node.target}')">${opt.text}</button>`;
        });
        html += `</div>`;
    }
    else if (node.type === 'reflection') {
        html += `<div class="tag">Insight</div>`;
        html += `<p class="node-text">${text}</p>`;
        html += `<div class="options-container">
                    <button class="primary" onclick="advance('${node.target}')">Continue</button>
                 </div>`;
    }
    else if (node.type === 'bridge') {
        html += `<p class="node-text" style="font-style: italic">${text}</p>`;
        html += `<div class="options-container">
                    <button class="primary" onclick="advance('${node.target}')">Continue</button>
                 </div>`;
    }
    else if (node.type === 'summary') {
        html += `<div class="tag">Summary</div>`;
        html += `<h1 class="node-title">Your Day in Review</h1>`;
        html += `<p class="node-text">${text}</p>`;
        html += `<div class="options-container">
                    <button class="primary" onclick="advance('${node.target}')">Finish</button>
                 </div>`;
    }
    else if (node.type === 'end') {
        html += `<div class="tag">Complete</div>`;
        html += `<h1 class="node-title">${text}</h1>`;
    }

    container.innerHTML = html;
}

window.advance = function(target) {
    currentNodeId = target;
    renderNode();
}

window.selectOption = function(nodeId, optionIdx, target) {
    const node = nodesMap[nodeId];
    const opt = node.options[optionIdx];
    
    answers[nodeId] = opt.text;
    
    if (opt.signal) {
        const [axis, pole] = opt.signal.split(':');
        if (!signals[axis]) signals[axis] = {};
        signals[axis][pole] = (signals[axis][pole] || 0) + 1;
    }
    
    currentNodeId = target;
    renderNode();
}

// UI 상호작용 관련 함수들

// 메뉴 테이블 업데이트
function updateMenuTable() {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    menuItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price.toLocaleString()}원</td>
            <td>${item.quantity}</td>
            <td>${item.total.toLocaleString()}원</td>
            <td>
                <button class="btn btn-danger" onclick="removeMenuItem(${item.id})">
                    삭제
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // 총합 업데이트
    const totalAmount = menuItems.reduce((sum, item) => sum + item.total, 0);
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = `총 금액: ${totalAmount.toLocaleString()}원`;
    }
}

// 참가자 목록 업데이트
function updateParticipantsList() {
    const container = document.getElementById('participantsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    participants.forEach(participant => {
        const participantElement = document.createElement('div');
        participantElement.className = 'card';
        participantElement.innerHTML = `
            <div class="card-body">
                <span>${participant}</span>
                <button class="btn btn-danger" onclick="removeParticipant('${participant}')" style="float: right;">
                    삭제
                </button>
            </div>
        `;
        container.appendChild(participantElement);
    });
}

// 소비 매트릭스 업데이트
function updateConsumptionMatrix() {
    const container = document.getElementById('consumptionMatrix');
    if (!container) return;
    
    if (menuItems.length === 0 || participants.length === 0) {
        container.innerHTML = '<p class="loading">메뉴와 참가자를 먼저 추가해주세요.</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>참가자</th>
                    ${menuItems.map(item => `<th>${item.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    participants.forEach(participant => {
        html += `<tr><td><strong>${participant}</strong></td>`;
        
        menuItems.forEach(item => {
            const currentValue = consumptionData[participant] && consumptionData[participant][item.id] || 0;
            html += `
                <td>
                    <input type="number" 
                           min="0" 
                           max="${item.quantity}"
                           value="${currentValue}"
                           onchange="updateConsumption('${participant}', ${item.id}, this.value)"
                           style="width: 60px; text-align: center;">
                </td>
            `;
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 계산 결과 표시
function displayResults(results) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    const validation = validateCalculation(results);
    
    let html = '<div class="section"><h3 class="section-title">💰 개인별 부담 금액</h3>';
    
    // 개인별 결과
    Object.entries(results.payments).forEach(([participant, amount]) => {
        const roundedAmount = Math.round(amount);
        html += `
            <div class="result-item">
                <span class="result-name">${participant}</span>
                <span class="result-amount">${roundedAmount.toLocaleString()}원</span>
            </div>
        `;
    });
    
    html += '</div>';
    
    // 상세 내역
    html += '<div class="section"><h3 class="section-title">📋 상세 내역</h3>';
    
    participants.forEach(participant => {
        const details = getParticipantDetails(participant, results.itemConsumers);
        if (details.length > 0) {
            html += `
                <div class="card">
                    <div class="card-header">${participant}의 소비 내역</div>
                    <div class="card-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>메뉴</th>
                                    <th>소비량</th>
                                    <th>총 소비자</th>
                                    <th>개인 부담</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            details.forEach(detail => {
                html += `
                    <tr>
                        <td>${detail.menuName}</td>
                        <td>${detail.quantity}</td>
                        <td>${detail.totalConsumers}명</td>
                        <td>${detail.totalCost.toLocaleString()}원</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div></div>';
        }
    });
    
    html += '</div>';
    
    // 검증 정보
    html += `
        <div class="section">
            <h3 class="section-title">🔍 계산 검증</h3>
            <p>전체 계산서: ${results.totalBill.toLocaleString()}원</p>
            <p>개인 부담 합계: ${Math.round(Object.values(results.payments).reduce((sum, payment) => sum + payment, 0)).toLocaleString()}원</p>
            <p>차이: ${Math.round(validation.difference)}원</p>
            ${validation.isValid ? 
                '<div class="success">✅ 계산이 정확합니다!</div>' : 
                '<div class="error">⚠️ 계산에 오차가 있습니다.</div>'
            }
        </div>
    `;
    
    container.innerHTML = html;
}

// 결과 업데이트 (빈 상태)
function updateResults() {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="section">
            <h3 class="section-title">📊 계산 결과</h3>
            <p class="loading">메뉴와 참가자를 추가한 후 "계산하기" 버튼을 눌러주세요.</p>
        </div>
    `;
}

// 메뉴 아이템 삭제
function removeMenuItem(itemId) {
    if (confirm('이 메뉴를 삭제하시겠습니까?')) {
        menuItems = menuItems.filter(item => item.id !== itemId);
        
        // 소비 데이터에서도 제거
        participants.forEach(participant => {
            if (consumptionData[participant]) {
                delete consumptionData[participant][itemId];
            }
        });
        
        updateMenuTable();
        updateConsumptionMatrix();
        showMessage('메뉴가 삭제되었습니다.', 'success');
    }
}

// 참가자 삭제
function removeParticipant(participantName) {
    if (confirm(`"${participantName}"을(를) 삭제하시겠습니까?`)) {
        participants = participants.filter(name => name !== participantName);
        delete consumptionData[participantName];
        
        updateParticipantsList();
        updateConsumptionMatrix();
        showMessage(`"${participantName}"이(가) 삭제되었습니다.`, 'success');
    }
}

// 키보드 이벤트 처리
document.addEventListener('keydown', function(event) {
    // Enter 키로 메뉴 추가
    if (event.target.id === 'menuName' || event.target.id === 'menuPrice' || event.target.id === 'menuQuantity') {
        if (event.key === 'Enter') {
            event.preventDefault();
            addMenuItem();
        }
    }
    
    // Enter 키로 참가자 추가
    if (event.target.id === 'participantName' && event.key === 'Enter') {
        event.preventDefault();
        addParticipant();
    }
});

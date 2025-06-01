// 더치페이 계산 로직

// 더치페이 계산 실행
function calculateDutchPay() {
    if (menuItems.length === 0) {
        showMessage('메뉴를 먼저 추가해주세요.', 'error');
        return;
    }
    
    if (participants.length === 0) {
        showMessage('참가자를 먼저 추가해주세요.', 'error');
        return;
    }
    
    try {
        const results = performCalculation();
        displayResults(results);
        showMessage('계산이 완료되었습니다!', 'success');
    } catch (error) {
        console.error('계산 중 오류 발생:', error);
        showMessage('계산 중 오류가 발생했습니다.', 'error');
    }
}

// 실제 계산 수행
function performCalculation() {
    const itemConsumers = {};
    const payments = {};
    
    // 참가자별 지불 금액 초기화
    participants.forEach(participant => {
        payments[participant] = 0;
    });
    
    // 각 메뉴별로 소비자 목록 생성
    menuItems.forEach(item => {
        itemConsumers[item.id] = [];
        
        participants.forEach(participant => {
            const consumption = consumptionData[participant] && consumptionData[participant][item.id];
            if (consumption && consumption > 0) {
                // 소비량만큼 소비자 목록에 추가
                for (let i = 0; i < consumption; i++) {
                    itemConsumers[item.id].push(participant);
                }
            }
        });
    });
    
    // 각 메뉴별로 비용 분할
    menuItems.forEach(item => {
        const consumers = itemConsumers[item.id];
        if (consumers.length > 0) {
            const costPerConsumer = item.total / consumers.length;
            
            consumers.forEach(consumer => {
                payments[consumer] += costPerConsumer;
            });
        }
    });
    
    return {
        payments: payments,
        itemConsumers: itemConsumers,
        totalBill: menuItems.reduce((sum, item) => sum + item.total, 0)
    };
}

// 메뉴별 소비자 정보 가져오기
function getMenuConsumers(menuId) {
    const consumers = [];
    
    participants.forEach(participant => {
        const consumption = consumptionData[participant] && consumptionData[participant][menuId];
        if (consumption && consumption > 0) {
            consumers.push({
                name: participant,
                quantity: consumption
            });
        }
    });
    
    return consumers;
}

// 참가자별 상세 내역 계산
function getParticipantDetails(participantName, itemConsumers) {
    const details = [];
    
    menuItems.forEach(item => {
        const consumption = consumptionData[participantName] && consumptionData[participantName][item.id];
        if (consumption && consumption > 0) {
            const totalConsumers = itemConsumers[item.id].length;
            const costPerConsumer = totalConsumers > 0 ? item.total / totalConsumers : 0;
            const participantCost = costPerConsumer * consumption;
            
            details.push({
                menuName: item.name,
                quantity: consumption,
                totalConsumers: totalConsumers,
                unitCost: Math.round(costPerConsumer),
                totalCost: Math.round(participantCost)
            });
        }
    });
    
    return details;
}

// 계산 결과 검증
function validateCalculation(results) {
    const totalPayments = Object.values(results.payments).reduce((sum, payment) => sum + payment, 0);
    const difference = Math.abs(results.totalBill - totalPayments);
    
    return {
        isValid: difference < 1, // 1원 미만 차이는 허용 (반올림 오차)
        difference: difference,
        totalBill: results.totalBill,
        totalPayments: totalPayments
    };
}

// 소비 데이터 업데이트
function updateConsumption(participantName, menuId, quantity) {
    if (!consumptionData[participantName]) {
        consumptionData[participantName] = {};
    }
    
    const qty = parseInt(quantity) || 0;
    if (qty > 0) {
        consumptionData[participantName][menuId] = qty;
    } else {
        delete consumptionData[participantName][menuId];
    }
    
    // 실시간 계산 업데이트 (옵션)
    if (document.getElementById('autoCalculate') && document.getElementById('autoCalculate').checked) {
        calculateDutchPay();
    }
}

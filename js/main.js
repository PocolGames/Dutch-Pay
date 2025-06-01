// 더치페이 계산기 - 메인 JavaScript 파일

// 전역 변수
let menuItems = [];
let participants = [];
let consumptionData = {};

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
function initializeApp() {
    console.log('더치페이 계산기 앱이 시작되었습니다.');
    
    // 이벤트 리스너 등록
    setupEventListeners();
    
    // UI 초기화
    updateMenuTable();
    updateParticipantsList();
    updateConsumptionMatrix();
    updateResults();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 메뉴 추가 버튼
    const addMenuBtn = document.getElementById('addMenuBtn');
    if (addMenuBtn) {
        addMenuBtn.addEventListener('click', addMenuItem);
    }
    
    // 참가자 추가 버튼
    const addParticipantBtn = document.getElementById('addParticipantBtn');
    if (addParticipantBtn) {
        addParticipantBtn.addEventListener('click', addParticipant);
    }
    
    // 계산하기 버튼
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateDutchPay);
    }
    
    // 초기화 버튼
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }
}

// 메뉴 아이템 추가
function addMenuItem() {
    const nameInput = document.getElementById('menuName');
    const priceInput = document.getElementById('menuPrice');
    const quantityInput = document.getElementById('menuQuantity');
    
    const name = nameInput.value.trim();
    const price = parseInt(priceInput.value) || 0;
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (!name || price <= 0) {
        showMessage('메뉴명과 가격을 올바르게 입력해주세요.', 'error');
        return;
    }
    
    const menuItem = {
        id: Date.now(),
        name: name,
        price: price,
        quantity: quantity,
        total: price * quantity
    };
    
    menuItems.push(menuItem);
    
    // 입력 필드 초기화
    nameInput.value = '';
    priceInput.value = '';
    quantityInput.value = '1';
    
    // UI 업데이트
    updateMenuTable();
    updateConsumptionMatrix();
    
    showMessage(`"${name}" 메뉴가 추가되었습니다.`, 'success');
}

// 참가자 추가
function addParticipant() {
    const nameInput = document.getElementById('participantName');
    const name = nameInput.value.trim();
    
    if (!name) {
        showMessage('참가자 이름을 입력해주세요.', 'error');
        return;
    }
    
    if (participants.includes(name)) {
        showMessage('이미 존재하는 참가자입니다.', 'error');
        return;
    }
    
    participants.push(name);
    nameInput.value = '';
    
    // 소비 데이터 초기화
    consumptionData[name] = {};
    
    // UI 업데이트
    updateParticipantsList();
    updateConsumptionMatrix();
    
    showMessage(`"${name}" 참가자가 추가되었습니다.`, 'success');
}

// 메시지 표시
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = type;
    messageElement.textContent = message;
    
    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageElement);
    
    // 3초 후 메시지 제거
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// 전체 초기화
function resetAll() {
    if (confirm('모든 데이터를 초기화하시겠습니까?')) {
        menuItems = [];
        participants = [];
        consumptionData = {};
        
        // 입력 필드 초기화
        document.getElementById('menuName').value = '';
        document.getElementById('menuPrice').value = '';
        document.getElementById('menuQuantity').value = '1';
        document.getElementById('participantName').value = '';
        
        // UI 업데이트
        updateMenuTable();
        updateParticipantsList();
        updateConsumptionMatrix();
        updateResults();
        
        showMessage('모든 데이터가 초기화되었습니다.', 'success');
    }
}

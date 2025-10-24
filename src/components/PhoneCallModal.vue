<template>
  <!-- 模拟打电话模态框 -->
  <div v-if="isVisible" class="phone-overlay" @click="handleOverlayClick">
    <div class="phone-container" @click.stop>
      <!-- 科室选择界面 -->
      <div v-if="currentStep === 'department'" class="phone-content">
        <div class="phone-header">
          <h3 class="phone-title">📞 选择联系科室</h3>
          <button class="phone-close" @click="handleClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="department-grid">
          <div 
            v-for="department in departments" 
            :key="department.id"
            class="department-card"
            @click="selectDepartment(department)"
          >
            <div class="department-icon">{{ department.icon }}</div>
            <div class="department-name">{{ department.name }}</div>
            <div class="department-desc">{{ department.description }}</div>
          </div>
        </div>
      </div>

      <!-- 人员选择界面 -->
      <div v-else-if="currentStep === 'person'" class="phone-content">
        <div class="phone-header">
          <button class="back-btn" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <h3 class="phone-title">选择联系人员</h3>
          <button class="phone-close" @click="handleClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="department-info">
          <span class="department-badge">{{ selectedDepartment?.name }}</span>
        </div>
        
        <div class="person-list">
          <div 
            v-for="person in currentPersons" 
            :key="person.id"
            class="person-card"
            @click="selectPerson(person)"
          >
            <div class="person-avatar">{{ person.name.charAt(0) }}</div>
            <div class="person-info">
              <div class="person-name">{{ person.name }}</div>
              <div class="person-role">{{ person.role }}</div>
              <div class="person-phone">{{ person.phone }}</div>
            </div>
            <div class="call-icon">📞</div>
          </div>
        </div>
      </div>

      <!-- 通话界面 -->
      <div v-else-if="currentStep === 'calling'" class="phone-content calling-interface">
        <div class="calling-header">
          <div class="calling-status">{{ callStatus }}</div>
        </div>
        
        <div class="calling-avatar">
          <div class="avatar-circle">{{ selectedPerson?.name.charAt(0) }}</div>
          <div class="calling-animation" v-if="callStatus === '正在拨号...'"></div>
        </div>
        
        <div class="calling-info">
          <div class="calling-name">{{ selectedPerson?.name }}</div>
          <div class="calling-role">{{ selectedPerson?.role }} - {{ selectedDepartment?.name }}</div>
          <div class="calling-phone">{{ selectedPerson?.phone }}</div>
        </div>
        
        <div class="calling-timer" v-if="callStatus === '通话中'">
          {{ formatTime(callDuration) }}
        </div>
        
        <div class="calling-actions">
          <button class="hang-up-btn" @click="hangUp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5.5C3 14.06 9.94 21 18.5 21C18.89 21 19 20.89 19 20.5V18.76C19 18.37 18.74 18.04 18.37 17.91L15.09 16.5C14.75 16.38 14.39 16.5 14.18 16.77L13.04 18.3C10.62 17.05 8.95 15.38 7.7 12.96L9.23 11.82C9.5 11.61 9.62 11.25 9.5 10.91L8.09 7.63C7.96 7.26 7.63 7 7.24 7H5.5C5.11 7 5 7.11 5 7.5C5 7.61 5 7.72 5 7.83C5.03 6.8 4.2 5.97 3.17 6C3.11 6 3.06 6 3 6V5.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'PhoneCallModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const currentStep = ref('department')
    const selectedDepartment = ref(null)
    const selectedPerson = ref(null)
    const callStatus = ref('正在拨号...')
    const callDuration = ref(0)
    let callTimer = null

    // 科室数据
    const departments = ref([
      {
        id: 'hospital',
        name: '医院总值班',
        icon: '🏥',
        description: '24小时值班电话'
      },
      {
        id: 'security',
        name: '保卫科',
        icon: '🛡️',
        description: '安全保卫部门'
      },
      {
        id: 'equipment',
        name: '设备科',
        icon: '🔧',
        description: '设备维护部门'
      },
      {
        id: 'nursing',
        name: '护理部',
        icon: '👩‍⚕️',
        description: '护理管理部门'
      },
      {
        id: 'medical',
        name: '医务科',
        icon: '⚕️',
        description: '医务管理部门'
      },
      {
        id: 'office',
        name: '院办',
        icon: '📋',
        description: '院办公室'
      }
    ])

    // 人员数据
    const persons = ref({
      hospital: [
        { id: 1, name: '张主任', role: '总值班主任', phone: '0571-88888888' },
        { id: 2, name: '李医生', role: '值班医生', phone: '0571-88888801' }
      ],
      security: [
        { id: 3, name: '王队长', role: '保卫队长', phone: '0571-88888889' },
        { id: 4, name: '陈保安', role: '值班保安', phone: '135****3415' }
      ],
      equipment: [
        { id: 5, name: '陈师傅', role: '工程技工', phone: '123****4215' },
        { id: 6, name: '吴师傅', role: '工程技工', phone: '134****0214' },
        { id: 7, name: '李经理', role: '工程经理', phone: '134****0214' }
      ],
      nursing: [
        { id: 8, name: '赵护士长', role: '护理部主任', phone: '0571-88888890' },
        { id: 9, name: '孙护士', role: '值班护士', phone: '0571-88888802' }
      ],
      medical: [
        { id: 10, name: '刘主任', role: '医务科主任', phone: '0571-88888891' },
        { id: 11, name: '周医生', role: '医务科医生', phone: '0571-88888803' }
      ],
      office: [
        { id: 12, name: '钱主任', role: '院办主任', phone: '0571-88888892' },
        { id: 13, name: '孙秘书', role: '院办秘书', phone: '0571-88888804' }
      ]
    })

    // 当前科室的人员列表
    const currentPersons = computed(() => {
      return selectedDepartment.value ? persons.value[selectedDepartment.value.id] || [] : []
    })

    // 选择科室
    const selectDepartment = (department) => {
      selectedDepartment.value = department
      currentStep.value = 'person'
    }

    // 选择人员并开始拨号
    const selectPerson = (person) => {
      selectedPerson.value = person
      currentStep.value = 'calling'
      startCall()
    }

    // 开始拨号
    const startCall = () => {
      callStatus.value = '正在拨号...'
      callDuration.value = 0
      
      // 模拟拨号过程
      setTimeout(() => {
        callStatus.value = '通话中'
        startTimer()
      }, 2000)
    }

    // 开始计时
    const startTimer = () => {
      callTimer = setInterval(() => {
        callDuration.value++
      }, 1000)
    }

    // 挂断电话
    const hangUp = () => {
      if (callTimer) {
        clearInterval(callTimer)
        callTimer = null
      }
      resetCall()
    }

    // 重置通话状态
    const resetCall = () => {
      currentStep.value = 'department'
      selectedDepartment.value = null
      selectedPerson.value = null
      callStatus.value = '正在拨号...'
      callDuration.value = 0
    }

    // 返回上一步
    const goBack = () => {
      if (currentStep.value === 'person') {
        currentStep.value = 'department'
        selectedDepartment.value = null
      }
    }

    // 关闭模态框
    const handleClose = () => {
      hangUp()
      emit('close')
    }

    // 处理遮罩点击
    const handleOverlayClick = () => {
      handleClose()
    }

    // 格式化时间
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // 清理定时器
    onUnmounted(() => {
      if (callTimer) {
        clearInterval(callTimer)
      }
    })

    return {
      currentStep,
      selectedDepartment,
      selectedPerson,
      callStatus,
      callDuration,
      departments,
      currentPersons,
      selectDepartment,
      selectPerson,
      hangUp,
      goBack,
      handleClose,
      handleOverlayClick,
      formatTime
    }
  }
}
</script>

<style scoped>
.phone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.phone-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.phone-content {
  padding: 32px;
}

.phone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.phone-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.phone-close, .back-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.phone-close:hover, .back-btn:hover {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* 科室选择界面 */
.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.department-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.department-card:hover {
  background: #e0f2fe;
  border-color: #0ea5e9;
  transform: translateY(-2px);
}

.department-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.department-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.department-desc {
  font-size: 12px;
  color: #64748b;
}

/* 人员选择界面 */
.department-info {
  margin-bottom: 20px;
}

.department-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.person-list {
  max-height: none;
  overflow-y: visible;
}

.person-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.person-card:hover {
  background: #e0f2fe;
  border-color: #0ea5e9;
  transform: translateX(4px);
}

.person-avatar {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  margin-right: 16px;
}

.person-info {
  flex: 1;
}

.person-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.person-role {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 2px;
}

.person-phone {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
}

.call-icon {
  font-size: 20px;
  color: #10b981;
}

/* 通话界面 */
.calling-interface {
  text-align: center;
  padding: 40px 24px;
}

.calling-header {
  margin-bottom: 32px;
}

.calling-status {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

.calling-avatar {
  position: relative;
  margin-bottom: 24px;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 600;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.calling-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border: 3px solid #3b82f6;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.calling-info {
  margin-bottom: 24px;
}

.calling-name {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.calling-role {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 4px;
}

.calling-phone {
  font-size: 18px;
  color: #3b82f6;
  font-weight: 500;
}

.calling-timer {
  font-size: 20px;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 32px;
}

.calling-actions {
  display: flex;
  justify-content: center;
}

.hang-up-btn {
  width: 64px;
  height: 64px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.hang-up-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .phone-overlay {
    padding: 16px;
  }
  
  .phone-content {
    padding: 24px;
  }
  
  .department-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .calling-interface {
    padding: 32px 24px;
  }
  
  .avatar-circle {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }
  
  .calling-animation {
    width: 120px;
    height: 120px;
  }
  
  .phone-container {
    max-width: 90vw;
  }
}

@media (max-width: 480px) {
  .phone-content {
    padding: 20px;
  }
  
  .department-grid {
    grid-template-columns: 1fr;
  }
}
</style>
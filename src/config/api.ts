export const API_CONFIG = {
  BASE_URL: 'https://backend-proy-production.up.railway.app', // Cambia por tu URL real

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/users/login',
      REGISTER: '/users/register',
      PROFILE: '/users/profile',
      CHANGE_PASSWORD: '/users/change-password'
    },
    INSTITUTIONS: {
      CREATE: '/institutions',
      MY_INSTITUTION: '/institutions/my-institution',
      ADD_TEACHER: '/institutions/:id/teachers',
      JOIN_REQUEST: '/institutions/:id/join-request',
      DETAILS: '/institutions/:id'
    },
    ANALYTICS: {
      STUDENT_RISK: '/analytics/student-risk',
      FEEDBACK_SENTIMENT: '/analytics/feedback-sentiment',
      HEALTH: '/analytics/health'
    }
  }
};
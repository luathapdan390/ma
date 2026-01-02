
export interface GoalFormState {
  targetDate: string;
  fullName: string;
  profitGoal: string;
  bankAccount: string;
  moneySound: string;
  location: string;
  dominantSense: string;
  companion: string;
  companionAge: string;
  companionActivity: string;
  congratulators: string;
  informalTitle: string;
  platform: string;
  professionalTitle: string;
}

export enum SenseType {
  HEARING = 'Nghe',
  SIGHT = 'Nhìn',
  SMELL = 'Ngửi',
  TASTE = 'Nếm',
  TOUCH = 'Chạm',
  FEELING = 'Cảm xúc nội tâm'
}

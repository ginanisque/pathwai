export type SupportedLanguage = 'en' | 'fr' | 'es' | 'pt' | 'sw' | 'ar';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' }
];

export const I18N_DICTIONARY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'nav.overview': 'Overview',
    'nav.agent': 'AI Agent',
    'nav.assessment': 'Visa Audit',
    'nav.relief': 'Relief & Student',
    'nav.profile': 'Mobility Profile',
    'nav.relocation': 'Roadmap',
    'nav.intelligence': 'Destination Intel',
    'nav.documents': 'Docs & Visas',
    'nav.interview': 'Interview',
    'nav.safety': 'Safety',
    'nav.alerts': 'Alerts',
    'nav.audit': 'Audit Log',
    'nav.admin': 'Admin Review',
    'btn.take_tour': 'Take Tour',
    'btn.clear_demo': 'Clear Demo Data',
    'btn.free_plan': 'FREE PLAN',
    'btn.pro_member': 'PRO MEMBER',
    'btn.consult_agent': 'Consult AI Agent',
    'btn.update_profile': 'Update Profile',
    'btn.safety_exit': 'Quick Safety Exit',
    'btn.emergency_sos': 'EMERGENCY SOS',
    'btn.save': 'Save Changes',
    'btn.cancel': 'Cancel',
    'btn.sign_in': 'Sign In',
    'btn.sign_out': 'Sign Out',
    'btn.create_account': 'Create Account',
    'label.language': 'Language',
    'label.role': 'Role',
    'status.active': 'Active',
    'status.secure': 'SECURE',
    'status.verified': 'Verified'
  },
  fr: {
    'nav.overview': 'Aperçu',
    'nav.agent': 'Agent IA',
    'nav.assessment': 'Audit Visa',
    'nav.relief': 'Secours & Étudiants',
    'nav.profile': 'Profil Mobilité',
    'nav.relocation': 'Feuille de Route',
    'nav.intelligence': 'Infos Destination',
    'nav.documents': 'Docs & Visas',
    'nav.interview': 'Entretien',
    'nav.safety': 'Sécurité',
    'nav.alerts': 'Alertes',
    'nav.audit': 'Journal d’Audit',
    'nav.admin': 'Examen Admin',
    'btn.take_tour': 'Visite Guidée',
    'btn.clear_demo': 'Effacer Démo',
    'btn.free_plan': 'PLAN GRATUIT',
    'btn.pro_member': 'MEMBRE PRO',
    'btn.consult_agent': 'Consulter l’Agent IA',
    'btn.update_profile': 'Mettre à Jour Profil',
    'btn.safety_exit': 'Sortie Sécurisée',
    'btn.emergency_sos': 'SOS URGENCE',
    'btn.save': 'Enregistrer',
    'btn.cancel': 'Annuler',
    'btn.sign_in': 'Se Connecter',
    'btn.sign_out': 'Déconnexion',
    'btn.create_account': 'Créer un Compte',
    'label.language': 'Langue',
    'label.role': 'Rôle',
    'status.active': 'Actif',
    'status.secure': 'SÉCURISÉ',
    'status.verified': 'Vérifié'
  },
  es: {
    'nav.overview': 'Visión General',
    'nav.agent': 'Agente IA',
    'nav.assessment': 'Auditoría Visa',
    'nav.relief': 'Auxilio y Estudiantes',
    'nav.profile': 'Perfil Movilidad',
    'nav.relocation': 'Hoja de Ruta',
    'nav.intelligence': 'Intel Destino',
    'nav.documents': 'Docs y Visas',
    'nav.interview': 'Entrevista',
    'nav.safety': 'Seguridad',
    'nav.alerts': 'Alertas',
    'nav.audit': 'Registro Auditoría',
    'nav.admin': 'Revisión Admin',
    'btn.take_tour': 'Iniciar Tour',
    'btn.clear_demo': 'Limpiar Datos Démo',
    'btn.free_plan': 'PLAN GRATUITO',
    'btn.pro_member': 'MIEMBRO PRO',
    'btn.consult_agent': 'Consultar Agente IA',
    'btn.update_profile': 'Actualizar Perfil',
    'btn.safety_exit': 'Salida Rápida',
    'btn.emergency_sos': 'SOS EMERGENCIA',
    'btn.save': 'Guardar Cambios',
    'btn.cancel': 'Cancelar',
    'btn.sign_in': 'Iniciar Sesión',
    'btn.sign_out': 'Cerrar Sesión',
    'btn.create_account': 'Crear Cuenta',
    'label.language': 'Idioma',
    'label.role': 'Rol',
    'status.active': 'Activo',
    'status.secure': 'SEGURO',
    'status.verified': 'Verificado'
  },
  pt: {
    'nav.overview': 'Visão Geral',
    'nav.agent': 'Agente IA',
    'nav.assessment': 'Auditoria de Visto',
    'nav.relief': 'Auxílio e Estudantes',
    'nav.profile': 'Perfil Mobilidade',
    'nav.relocation': 'Roteiro de Viagem',
    'nav.intelligence': 'Intel Destino',
    'nav.documents': 'Docs e Vistos',
    'nav.interview': 'Entrevista',
    'nav.safety': 'Segurança',
    'nav.alerts': 'Alertas',
    'nav.audit': 'Registo Auditoria',
    'nav.admin': 'Revisão Admin',
    'btn.take_tour': 'Ver Guia',
    'btn.clear_demo': 'Limpar Dados Demo',
    'btn.free_plan': 'PLANO GRÁTIS',
    'btn.pro_member': 'MEMBRO PRO',
    'btn.consult_agent': 'Consultar Agente IA',
    'btn.update_profile': 'Atualizar Perfil',
    'btn.safety_exit': 'Saída Rápida',
    'btn.emergency_sos': 'SOS EMERGÊNCIA',
    'btn.save': 'Guardar Alterações',
    'btn.cancel': 'Cancelar',
    'btn.sign_in': 'Iniciar Sessão',
    'btn.sign_out': 'Sair',
    'btn.create_account': 'Criar Conta',
    'label.language': 'Idioma',
    'label.role': 'Função',
    'status.active': 'Ativo',
    'status.secure': 'SEGURO',
    'status.verified': 'Verificado'
  },
  sw: {
    'nav.overview': 'Muhtasari',
    'nav.agent': 'Wakala wa AI',
    'nav.assessment': 'Ukaguzi wa Visa',
    'nav.relief': 'Msaada na Wanafunzi',
    'nav.profile': 'Profaili ya Uhamaji',
    'nav.relocation': 'Ramani ya Safari',
    'nav.intelligence': 'Taarifa za Nchi',
    'nav.documents': 'Hati na Visa',
    'nav.interview': 'Mahojiano',
    'nav.safety': 'Usalama',
    'nav.alerts': 'Tahadhari',
    'nav.audit': 'Kumbukumbu',
    'nav.admin': 'Ukaguzi Admin',
    'btn.take_tour': 'Anza Mwongozo',
    'btn.clear_demo': 'Futa Data ya Demo',
    'btn.free_plan': 'MPANGO LIBRE',
    'btn.pro_member': 'MWANACHAMA PRO',
    'btn.consult_agent': 'Pata Ushauri wa AI',
    'btn.update_profile': 'Boresha Profaili',
    'btn.safety_exit': 'Toka kwa Haraka',
    'btn.emergency_sos': 'SOS DHARURA',
    'btn.save': 'Hifadhi Mabadiliko',
    'btn.cancel': 'Ghairi',
    'btn.sign_in': 'Ingia',
    'btn.sign_out': 'Toka',
    'btn.create_account': 'Tengeneza Akaunti',
    'label.language': 'Lugha',
    'label.role': 'Wajibu',
    'status.active': 'Inafanya Kazi',
    'status.secure': 'SALAMA',
    'status.verified': 'Imethibitishwa'
  },
  ar: {
    'nav.overview': 'نظرة عامة',
    'nav.agent': 'وكيل الذكاء الاصطناعي',
    'nav.assessment': 'تدقيق التأشيرة',
    'nav.relief': 'الإغاثة والطلاب',
    'nav.profile': 'ملف التنقل',
    'nav.relocation': 'خارطة الطريق',
    'nav.intelligence': 'معلومات الوجهة',
    'nav.documents': 'المستندات والتأشيرات',
    'nav.interview': 'المقابلة',
    'nav.safety': 'السلامة',
    'nav.alerts': 'التنبيهات',
    'nav.audit': 'سجل التدقيق',
    'nav.admin': 'مراجعة المشرف',
    'btn.take_tour': 'جولة تعريفية',
    'btn.clear_demo': 'مسح البيانات التوضيحية',
    'btn.free_plan': 'خطة مجانية',
    'btn.pro_member': 'عضوية احترافية',
    'btn.consult_agent': 'استشارة الذكاء الاصطناعي',
    'btn.update_profile': 'تحديث الملف',
    'btn.safety_exit': 'خروج آمن سريع',
    'btn.emergency_sos': 'طوارئ SOS',
    'btn.save': 'حفظ التغييرات',
    'btn.cancel': 'إلغاء',
    'btn.sign_in': 'تسجيل الدخول',
    'btn.sign_out': 'تسجيل الخروج',
    'btn.create_account': 'إنشاء حساب',
    'label.language': 'اللغة',
    'label.role': 'الدور',
    'status.active': 'نشط',
    'status.secure': 'آمن',
    'status.verified': 'موثق'
  }
};

export function translate(key: string, lang: SupportedLanguage = 'en', fallback?: string): string {
  const dict = I18N_DICTIONARY[lang] || I18N_DICTIONARY['en'];
  return dict[key] || I18N_DICTIONARY['en'][key] || fallback || key;
}

export const t = translate;

export function getLanguageOption(code: SupportedLanguage): LanguageOption {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

export function applyLanguageDirection(code: SupportedLanguage): void {
  const option = getLanguageOption(code);
  if (typeof document !== 'undefined') {
    document.documentElement.dir = option.dir;
    document.documentElement.lang = option.code;
  }
}


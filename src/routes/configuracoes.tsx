import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useTheme } from "@/components/layout/theme-provider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Moon,
  Sun,
  Trash2,
  Search,
  Download,
  Upload,
  RotateCcw,
  User,
  Palette,
  Bell,
  Shield,
  Clock,
  Save,
  Plus,
  Trash,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — GreenLink ADM" }] }),
  component: Config,
});

interface SettingsChange {
  id: string;
  timestamp: string;
  category: string;
  setting: string;
  oldValue: string;
  newValue: string;
}

interface SettingsProfile {
  id: string;
  name: string;
  createdAt: string;
  settings: Record<string, unknown>;
}

interface SettingsState {
  theme: "light" | "dark";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
  density: "compact" | "normal" | "comfortable";
}

const defaultSettings: SettingsState = {
  theme: "light",
  notifications: { email: true, push: true, sms: false },
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  density: "normal",
};

const SETTINGS_STORAGE_KEY = "greenlink-settings";
const PROFILES_STORAGE_KEY = "greenlink-settings-profiles";
const AUDIT_STORAGE_KEY = "greenlink-settings-audit";

const SETTINGS_TABS = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "perfis", label: "Perfis", icon: Save },
  { id: "historico", label: "Histórico", icon: Clock },
];

function Config() {
  const { theme, toggle } = useTheme();
  const { user, profile, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [profiles, setProfiles] = useState<SettingsProfile[]>([]);
  const [auditLog, setAuditLog] = useState<SettingsChange[]>([]);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        email: profile.email || user?.email || "",
      });
    } else if (user) {
      setProfileForm({
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
      });
    }
  }, [profile, user]);

  const saveProfile = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar o perfil.");
      return;
    }
    setSavingProfile(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: profileForm.full_name })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success("Perfil salvo com sucesso!");
    } catch (err) {
      console.error(err);
      const e = err as { message?: string };
      toast.error(e.message || "Erro ao salvar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored settings", e);
      }
    }
    const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (storedProfiles) {
      try {
        setProfiles(JSON.parse(storedProfiles));
      } catch (e) {
        console.error("Failed to parse stored profiles", e);
      }
    }
    const storedAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (storedAudit) {
      try {
        setAuditLog(JSON.parse(storedAudit));
      } catch (e) {
        console.error("Failed to parse stored audit", e);
      }
    }
  }, []);

  const logChange = (category: string, setting: string, oldValue: string, newValue: string) => {
    const change: SettingsChange = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      category,
      setting,
      oldValue,
      newValue,
    };
    const updated = [change, ...auditLog].slice(0, 50);
    setAuditLog(updated);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
    category: string,
    settingLabel: string,
  ) => {
    const oldValue = JSON.stringify(settings[key]);
    setSettings((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...settings, [key]: value }));
    logChange(category, settingLabel, oldValue, JSON.stringify(value));
  };

  const exportSettings = () => {
    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greenlink-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configurações exportadas");
  };

  const importSettings = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.settings));
          toast.success("Configurações importadas");
        }
      } catch {
        toast.error("Arquivo inválido");
      }
    };
    reader.readAsText(file);
  };

  const saveSettingsProfile = () => {
    if (!newProfileName.trim()) {
      toast.error("Informe um nome para o perfil");
      return;
    }
    const profile: SettingsProfile = {
      id: crypto.randomUUID(),
      name: newProfileName.trim(),
      createdAt: new Date().toISOString(),
      settings: { ...settings },
    };
    const updated = [...profiles, profile];
    setProfiles(updated);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
    setNewProfileName("");
    setShowProfileDialog(false);
    toast.success(`Perfil "${profile.name}" salvo`);
  };

  const loadProfile = (profile: SettingsProfile) => {
    setSettings(profile.settings as SettingsState);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(profile.settings));
    if (profile.settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`Perfil "${profile.name}" carregado`);
  };

  const deleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
    toast.success("Perfil removido");
  };

  const revertChange = (changeId: string) => {
    const change = auditLog.find((c) => c.id === changeId);
    if (!change) return;
    const key = change.setting.toLowerCase().replace(/\s+/g, "_") as keyof SettingsState;
    if (key in settings) {
      try {
        const oldVal = JSON.parse(change.oldValue);
        const updatedSettings = { ...settings, [key]: oldVal };
        setSettings(updatedSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
        toast.success("Alteração revertida");
      } catch {
        toast.error("Não foi possível reverter");
      }
    }
  };

  const clearAuditLog = () => {
    setAuditLog([]);
    localStorage.removeItem(AUDIT_STORAGE_KEY);
    toast.success("Histórico limpo");
  };

  const filteredTabs = useMemo(() => {
    if (!search.trim()) return SETTINGS_TABS;
    const q = search.toLowerCase();
    return SETTINGS_TABS.filter((t) => t.label.toLowerCase().includes(q) || t.id.includes(q));
  }, [search]);

  return (
    <PageContainer>
      <PageHeader title="Configurações" description="Gerencie suas preferências e configurações." />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar configurações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Buscar configurações"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportSettings}
            aria-label="Exportar configurações"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <label htmlFor="import-file">
            <Button variant="outline" size="sm" asChild className="cursor-pointer">
              <span>
                <Upload className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Importar</span>
              </span>
            </Button>
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && importSettings(e.target.files[0])}
            className="hidden"
            aria-label="Importar arquivo de configurações"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:min-w-[180px] pb-2 md:pb-0">
          {filteredTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              className="justify-start whitespace-nowrap"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          {activeTab === "perfil" && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil
              </h3>
              {authLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-name">Nome</Label>
                      <Input
                        id="profile-name"
                        value={profileForm.full_name}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-email">E-mail</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O e-mail não pode ser alterado. Entre em contato com o suporte se precisar
                    mudá-lo.
                  </p>
                  <Button onClick={saveProfile} disabled={savingProfile}>
                    {savingProfile && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Salvar alterações
                  </Button>
                </>
              )}
            </Card>
          )}

          {activeTab === "aparencia" && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </h3>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    Atual: {settings.theme === "dark" ? "Escuro" : "Claro"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggle();
                    updateSetting(
                      "theme",
                      settings.theme === "dark" ? "light" : "dark",
                      "Aparência",
                      "Tema",
                    );
                  }}
                  aria-label={`Alternar para tema ${settings.theme === "dark" ? "claro" : "escuro"}`}
                >
                  {settings.theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4 mr-1" /> Claro
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-1" /> Escuro
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="density-select">Densidade</Label>
                <select
                  id="density-select"
                  value={settings.density}
                  onChange={(e) =>
                    updateSetting(
                      "density",
                      e.target.value as SettingsState["density"],
                      "Aparência",
                      "Densidade",
                    )
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  aria-label="Selecionar densidade da interface"
                >
                  <option value="compact">Compacto</option>
                  <option value="normal">Normal</option>
                  <option value="comfortable">Confortável</option>
                </select>
              </div>
            </Card>
          )}

          {activeTab === "notificacoes" && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div>
                    <p className="font-medium">Notificações por e-mail</p>
                    <p className="text-sm text-muted-foreground">Receba atualizações por e-mail</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) =>
                      updateSetting(
                        "notifications",
                        { ...settings.notifications, email: e.target.checked },
                        "Notificações",
                        "E-mail",
                      )
                    }
                    className="h-5 w-5"
                    aria-label="Ativar notificações por e-mail"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div>
                    <p className="font-medium">Notificações push</p>
                    <p className="text-sm text-muted-foreground">Receba alertas no navegador</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) =>
                      updateSetting(
                        "notifications",
                        { ...settings.notifications, push: e.target.checked },
                        "Notificações",
                        "Push",
                      )
                    }
                    className="h-5 w-5"
                    aria-label="Ativar notificações push"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">Receba mensagens de texto</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) =>
                      updateSetting(
                        "notifications",
                        { ...settings.notifications, sms: e.target.checked },
                        "Notificações",
                        "SMS",
                      )
                    }
                    className="h-5 w-5"
                    aria-label="Ativar notificações SMS"
                  />
                </label>
              </div>
            </Card>
          )}

          {activeTab === "seguranca" && (
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
                <Button onClick={() => toast.success("Senha alterada (demo)")}>
                  Alterar senha
                </Button>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => {
                    localStorage.removeItem("greenlink-adm-v1");
                    location.reload();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Resetar todos os dados
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "perfis" && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Perfis de configuração
                </h3>
                <Button size="sm" onClick={() => setShowProfileDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo perfil
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Salve conjuntos de configurações para alternar rapidamente entre diferentes perfis.
              </p>
              {profiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum perfil salvo.</p>
                  <p className="text-sm">Crie um perfil para salvar suas configurações atuais.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => loadProfile(profile)}>
                          Carregar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteProfile(profile.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showProfileDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md p-5 space-y-4">
                    <h4 className="font-semibold">Novo perfil</h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-name-input">Nome do perfil</Label>
                      <Input
                        id="profile-name-input"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="Ex: Trabalho, Pessoal"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowProfileDialog(false);
                          setNewProfileName("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={saveSettingsProfile}>Salvar perfil</Button>
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          )}

          {activeTab === "historico" && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de alterações
                </h3>
                {auditLog.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearAuditLog}>
                    Limpar
                  </Button>
                )}
              </div>
              {auditLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma alteração registrada.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLog.map((change) => (
                    <div
                      key={change.id}
                      className="flex items-start justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{change.setting}</span>
                          <span className="text-xs text-muted-foreground">
                            em {change.category}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          <span className="line-through text-destructive">{change.oldValue}</span>
                          {" → "}
                          <span className="text-success">{change.newValue}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(change.timestamp).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => revertChange(change.id)}
                        title="Reverter"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

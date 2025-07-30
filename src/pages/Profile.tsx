import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Clock, Bell, Shield, Eye, Save, Upload, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  
  // Professional info
  professional_title?: string;
  institution?: string;
  department?: string;
  specialty?: string;
  license_number?: string;
  experience_years?: number;
  
  // Personal info
  phone?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  
  // Preferences
  language?: string;
  timezone?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  dark_mode?: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load user profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      
      // Get or create profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: user!.id,
          email: user!.email!,
          full_name: user!.user_metadata?.full_name || user!.email?.split('@')[0] || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        data = createdProfile;
      } else if (error) {
        throw error;
      }

      setProfile(data as any);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value,
        updated_at: new Date().toISOString()
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Imagem muito grande (máximo 5MB)');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    try {
      setIsUploadingImage(true);

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new image
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      handleInputChange('avatar_url', publicUrl);
      toast.success('Foto de perfil atualizada!');

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!profile?.avatar_url || !user) return;

    try {
      setIsUploadingImage(true);

      // Delete from storage
      const oldPath = profile.avatar_url.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldPath}`]);
      }

      // Update profile
      handleInputChange('avatar_url', null);
      toast.success('Foto de perfil removida!');

    } catch (error: any) {
      console.error('Error removing image:', error);
      toast.error('Erro ao remover imagem');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Perfil salvo com sucesso!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Voltar ao Dashboard</span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                <span className="hidden sm:inline">Configurações do </span>Perfil
              </h1>
            </div>
          </div>
          <Badge variant="secondary" className="hidden md:flex text-xs">
            Conta Profissional
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Picture Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto de Perfil
              </CardTitle>
              <CardDescription>
                Adicione uma foto para personalizar seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="text-base sm:text-lg">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3 text-center sm:text-left">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 sm:mr-2" />
                      <span className="sm:inline">{isUploadingImage ? 'Enviando...' : 'Alterar Foto'}</span>
                    </Button>
                    {profile.avatar_url && (
                      <Button
                        variant="outline"
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="sm:inline">Remover</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou GIF. Máximo 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Cidade, Estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Informações Profissionais
              </CardTitle>
              <CardDescription>
                Dados da sua carreira em enfermagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="professional_title">Título Profissional</Label>
                  <Select
                    value={profile.professional_title || ''}
                    onValueChange={(value) => handleInputChange('professional_title', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu título" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnico">Técnico(a) em Enfermagem</SelectItem>
                      <SelectItem value="enfermeiro">Enfermeiro(a)</SelectItem>
                      <SelectItem value="especialista">Enfermeiro(a) Especialista</SelectItem>
                      <SelectItem value="residente">Residente de Enfermagem</SelectItem>
                      <SelectItem value="supervisor">Supervisor(a) de Enfermagem</SelectItem>
                      <SelectItem value="coordenador">Coordenador(a) de Enfermagem</SelectItem>
                      <SelectItem value="estudante">Estudante de Enfermagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select
                    value={profile.specialty || ''}
                    onValueChange={(value) => handleInputChange('specialty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sua especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uti">UTI / Terapia Intensiva</SelectItem>
                      <SelectItem value="emergencia">Emergência / Pronto Socorro</SelectItem>
                      <SelectItem value="pediatria">Pediatria</SelectItem>
                      <SelectItem value="obstetricia">Obstetrícia</SelectItem>
                      <SelectItem value="cirurgica">Enfermagem Cirúrgica</SelectItem>
                      <SelectItem value="oncologia">Oncologia</SelectItem>
                      <SelectItem value="cardiologia">Cardiologia</SelectItem>
                      <SelectItem value="psiquiatria">Saúde Mental / Psiquiatria</SelectItem>
                      <SelectItem value="home_care">Home Care</SelectItem>
                      <SelectItem value="geral">Clínica Geral</SelectItem>
                      <SelectItem value="outro">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Instituição</Label>
                  <Input
                    id="institution"
                    value={profile.institution || ''}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    placeholder="Hospital / Clínica onde trabalha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento / Setor</Label>
                  <Input
                    id="department"
                    value={profile.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Ex: UTI, Emergência, CC..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">Número do Registro (COREN)</Label>
                  <Input
                    id="license_number"
                    value={profile.license_number || ''}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    placeholder="Ex: 123456-SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Anos de Experiência</Label>
                  <Select
                    value={profile.experience_years?.toString() || ''}
                    onValueChange={(value) => handleInputChange('experience_years', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tempo de experiência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Estudante / Recém-formado</SelectItem>
                      <SelectItem value="1">Menos de 1 ano</SelectItem>
                      <SelectItem value="2">1-2 anos</SelectItem>
                      <SelectItem value="3">3-5 anos</SelectItem>
                      <SelectItem value="6">6-10 anos</SelectItem>
                      <SelectItem value="11">11-15 anos</SelectItem>
                      <SelectItem value="16">16-20 anos</SelectItem>
                      <SelectItem value="21">Mais de 20 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferências
              </CardTitle>
              <CardDescription>
                Configure como você usa o aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={profile.language || 'pt'}
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={profile.timezone || 'America/Sao_Paulo'}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications">Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber lembretes de estudo e atualizações
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={profile.email_notifications ?? true}
                      onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push_notifications">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações no navegador
                      </p>
                    </div>
                    <Switch
                      id="push_notifications"
                      checked={profile.push_notifications ?? true}
                      onCheckedChange={(checked) => handleInputChange('push_notifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
              <CardDescription>
                Detalhes da sua conta no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conta criada em</Label>
                  <div className="text-sm bg-muted p-2 rounded">
                    {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Última atualização</Label>
                  <div className="text-sm bg-muted p-2 rounded">
                    {new Date(profile.updated_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
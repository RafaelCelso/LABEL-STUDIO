import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  createImporter,
  deleteImporter,
  getImporterById,
  getImporters,
  updateImporter,
} from "@/app/actions/importer";
import {
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Save,
  Ship,
  Pencil,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ConfirmationModal } from "./ui/confirmation-modal";

const UFs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const PAISES = [
  { code: "BR", nome: "Brasil", flag: "🇧🇷" },
  { code: "CN", nome: "China", flag: "🇨🇳" },
  { code: "US", nome: "Estados Unidos", flag: "🇺🇸" },
  { code: "DE", nome: "Alemanha", flag: "🇩🇪" },
  { code: "JP", nome: "Japão", flag: "🇯🇵" },
  { code: "IT", nome: "Itália", flag: "🇮🇹" },
  { code: "AR", nome: "Argentina", flag: "🇦🇷" },
  { code: "MX", nome: "México", flag: "🇲🇽" },
  { code: "GB", nome: "Reino Unido", flag: "🇬🇧" },
  { code: "FR", nome: "França", flag: "🇫🇷" },
  { code: "ES", nome: "Espanha", flag: "🇪🇸" },
  { code: "PT", nome: "Portugal", flag: "🇵🇹" },
  { code: "IN", nome: "Índia", flag: "🇮🇳" },
  { code: "TW", nome: "Taiwan", flag: "🇹🇼" },
  { code: "KR", nome: "Coreia do Sul", flag: "🇰🇷" },
  { code: "VN", nome: "Vietnã", flag: "🇻🇳" },
  { code: "UY", nome: "Uruguai", flag: "🇺🇾" },
  { code: "PY", nome: "Paraguai", flag: "🇵🇾" },
  { code: "CL", nome: "Chile", flag: "🇨🇱" },
  { code: "CO", nome: "Colômbia", flag: "🇨🇴" },
  { code: "ZZ", nome: "Outro País", flag: "🌍" },
].sort((a, b) => a.nome.localeCompare(b.nome));

// Funções de Máscara (Sem Libs Externas)
const digitsOnly = (v: string) => v.replace(/\D/g, "");

const maskCNPJ = (v: string) => {
  v = v.replace(/\D/g, "");
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18);
};

const maskCEP = (v: string) => {
  v = v.replace(/\D/g, "");
  return v.replace(/^(\d{5})(\d)/, "$1-$2").substring(0, 9);
};

const maskNumero = (v: string) => {
  return v.replace(/\D/g, "");
};

const maskTelefone = (v: string) => {
  v = v.replace(/\D/g, "");
  if (v.startsWith("0800")) {
    return v
      .replace(/^(\d{4})(\d)/, "$1 $2")
      .replace(/^(\d{4}) (\d{3})(\d)/, "$1 $2 $3")
      .substring(0, 14); // 0800 000 0000
  }
  if (v.length > 10) {
    return v
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15); // (00) 00000-0000
  }
  return v
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 14); // (00) 0000-0000
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

type ImporterListItem = {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
};

export function ImporterManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [importerToDelete, setImporterToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [importers, setImporters] = useState<ImporterListItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [listSearchQuery, setListSearchQuery] = useState("");

  const filteredImporters = useMemo(() => {
    const raw = listSearchQuery.trim();
    if (!raw) return importers;
    const qLower = raw.toLowerCase();
    const qDigits = digitsOnly(raw);
    return importers.filter((im) => {
      if (im.name.toLowerCase().includes(qLower)) return true;
      const locality = `${im.city} / ${im.state}`.toLowerCase();
      if (locality.includes(qLower)) return true;
      if (im.cnpj.toLowerCase().includes(qLower)) return true;
      if (qDigits.length > 0 && digitsOnly(im.cnpj).includes(qDigits))
        return true;
      return false;
    });
  }, [importers, listSearchQuery]);

  const loadImporters = useCallback(async () => {
    setIsLoadingList(true);
    const rows = await getImporters();
    setImporters(
      rows.map((r) => ({
        id: r.id,
        name: r.razao_social,
        cnpj: maskCNPJ(r.cnpj),
        city: r.cidade,
        state: r.estado,
      })),
    );
    setIsLoadingList(false);
  }, []);

  useEffect(() => {
    void loadImporters();
  }, [loadImporters]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const cepRequestId = useRef(0);
  /** Evita disparar ViaCEP ao abrir edição com CEP já preenchido (preserva endereço salvo). */
  const ignoreNextCepDigitsRef = useRef<string | null>(null);

  // Estado do Formulário Controlado
  const [formData, setFormData] = useState({
    razao: "",
    cnpj: "",
    pais: "Brasil",
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    logradouro: "",
    numero: "",
    complemento: "",
    email: "",
    telCapitais: "",
    telDemais: "",
  });

  const resetForm = useCallback(() => {
    setFormData({
      razao: "",
      cnpj: "",
      pais: "Brasil",
      cep: "",
      estado: "",
      cidade: "",
      bairro: "",
      logradouro: "",
      numero: "",
      complemento: "",
      email: "",
      telCapitais: "",
      telDemais: "",
    });
    setErrors({});
    setEditingId(null);
    cepRequestId.current += 1;
    ignoreNextCepDigitsRef.current = null;
    setIsCepLoading(false);
  }, []);

  /** Brasil: ao completar 8 dígitos do CEP, preenche endereço via ViaCEP. */
  useEffect(() => {
    if (!isFormOpen || formData.pais !== "Brasil") {
      setIsCepLoading(false);
      return;
    }
    const d = formData.cep.replace(/\D/g, "");
    if (
      ignoreNextCepDigitsRef.current !== null &&
      d === ignoreNextCepDigitsRef.current
    ) {
      setIsCepLoading(false);
      return;
    }
    if (d.length !== 8) {
      setIsCepLoading(false);
      return;
    }

    const reqId = ++cepRequestId.current;
    setIsCepLoading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cep;
      return next;
    });

    void fetch(`https://viacep.com.br/ws/${d}/json/`)
      .then((r) => r.json())
      .then((data: ViaCepResponse) => {
        if (reqId !== cepRequestId.current) return;
        setIsCepLoading(false);
        if (data.erro) {
          setErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }));
          return;
        }
        setFormData((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
          complemento: (prev.complemento || "").trim()
            ? prev.complemento
            : (data.complemento || "").trim(),
        }));
      })
      .catch(() => {
        if (reqId !== cepRequestId.current) return;
        setIsCepLoading(false);
        setErrors((prev) => ({
          ...prev,
          cep: "Não foi possível buscar o CEP",
        }));
      });
  }, [isFormOpen, formData.cep, formData.pais]);

  const handleChange = (
    field: keyof typeof formData,
    value: string,
    maskifier?: (v: string) => string,
  ) => {
    if (field === "cep") {
      ignoreNextCepDigitsRef.current = null;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: maskifier ? maskifier(value) : value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.razao.trim()) {
      newErrors.razao = "Obrigatório";
    }

    const cnpjDigits = formData.cnpj.replace(/\D/g, "");
    if (cnpjDigits.length !== 14) {
      newErrors.cnpj = "CNPJ incompleto";
    }

    if (formData.pais === "Brasil") {
      if (formData.cep.replace(/\D/g, "").length !== 8) {
        newErrors.cep = "CEP inválido";
      }
    } else if (!formData.cep.trim()) {
      newErrors.cep = "Informe o CEP ou código postal";
    }

    if (!formData.estado.trim()) {
      newErrors.estado = "Obrigatório";
    }
    if (!formData.cidade.trim()) {
      newErrors.cidade = "Obrigatório";
    }
    if (!formData.bairro.trim()) {
      newErrors.bairro = "Obrigatório";
    }
    if (!formData.logradouro.trim()) {
      newErrors.logradouro = "Obrigatório";
    }
    if (!formData.numero.trim()) {
      newErrors.numero = "Obrigatório";
    }

    if (
      formData.pais === "Brasil" &&
      formData.telCapitais &&
      formData.telCapitais.length < 14
    ) {
      newErrors.telCapitais = "Mín. 10 dígitos";
    }

    if (
      formData.pais === "Brasil" &&
      formData.telDemais &&
      formData.telDemais.length < 14
    ) {
      newErrors.telDemais = "Mín. 10 dígitos";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cepStored =
      formData.pais === "Brasil"
        ? maskCEP(formData.cep.replace(/\D/g, ""))
        : formData.cep.trim();

    const payload = {
      razao_social: formData.razao.trim(),
      cnpj: cnpjDigits,
      pais: formData.pais,
      cep: cepStored,
      estado: formData.estado.trim(),
      cidade: formData.cidade.trim(),
      bairro: formData.bairro.trim(),
      logradouro: formData.logradouro.trim(),
      numero: formData.numero.trim(),
      complemento: formData.complemento.trim() || null,
      email: formData.email.trim().toLowerCase(),
      tel_capitais: formData.telCapitais.trim() || null,
      tel_demais: formData.telDemais.trim() || null,
    };

    setIsSaving(true);
    try {
      const result = editingId
        ? await updateImporter(editingId, payload)
        : await createImporter(payload);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível salvar.");
        return;
      }

      toast.success(
        editingId
          ? "Importador atualizado com sucesso."
          : "Importador cadastrado com sucesso.",
      );
      resetForm();
      setIsFormOpen(false);
      void loadImporters();
    } finally {
      setIsSaving(false);
    }
  };

  const openEditImporter = async (id: string) => {
    setLoadingEditId(id);
    const row = await getImporterById(id);
    setLoadingEditId(null);
    if (!row) {
      toast.error("Não foi possível carregar o importador.");
      return;
    }
    const cepDigits = row.cep.replace(/\D/g, "");
    if (row.pais === "Brasil" && cepDigits.length === 8) {
      ignoreNextCepDigitsRef.current = cepDigits;
    } else {
      ignoreNextCepDigitsRef.current = null;
    }
    cepRequestId.current += 1;
    setEditingId(id);
    setFormData({
      razao: row.razao_social,
      cnpj: maskCNPJ(row.cnpj.replace(/\D/g, "")),
      pais: row.pais,
      cep:
        row.pais === "Brasil" && cepDigits.length === 8
          ? maskCEP(cepDigits)
          : row.cep,
      estado: row.estado,
      cidade: row.cidade,
      bairro: row.bairro,
      logradouro: row.logradouro,
      numero: row.numero,
      complemento: row.complemento ?? "",
      email: row.email ?? "",
      telCapitais: row.tel_capitais
        ? row.pais === "Brasil"
          ? maskTelefone(row.tel_capitais.replace(/\D/g, ""))
          : row.tel_capitais
        : "",
      telDemais: row.tel_demais
        ? row.pais === "Brasil"
          ? maskTelefone(row.tel_demais.replace(/\D/g, ""))
          : row.tel_demais
        : "",
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const handleDeleteImporter = (id: string, name: string) => {
    setImporterToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteImporter = async () => {
    if (!importerToDelete) return;
    const result = await deleteImporter(importerToDelete.id);
    if (!result.success) {
      toast.error(result.error ?? "Não foi possível excluir o importador.");
      return;
    }
    toast.success("Importador excluído.");
    setImporterToDelete(null);
    void loadImporters();
  };

  if (isFormOpen) {
    return (
      <div className="w-full h-full flex flex-col pt-6 pb-12 px-4 sm:px-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl w-full mx-auto">
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(false);
            }}
            className="-ml-1 mb-6 flex w-fit cursor-pointer items-center rounded p-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar para lista
          </button>

          <h2 className="mb-8 flex items-center border-b border-border/60 pb-4 font-serif text-3xl font-light text-foreground">
            <Ship className="mr-3 h-8 w-8 text-primary opacity-90" />
            {editingId ? (
              <>
                Editar{" "}
                <span className="font-semibold text-foreground ml-2">
                  Importador
                </span>
              </>
            ) : (
              <>
                Novo{" "}
                <span className="font-semibold text-foreground ml-2">
                  Importador
                </span>
              </>
            )}
          </h2>

          <div className="auth-frost-panel space-y-8 p-8">
            {/* Section 1: Principal */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Dados Principais</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Razão Social / Nome</span>
                    {errors.razao && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.razao}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.razao}
                    onChange={(e) => handleChange("razao", e.target.value)}
                    className={`w-full flex h-10 rounded-md border ${errors.razao ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent`}
                    placeholder="Ex: Importadora XYZ Ltda"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>CNPJ</span>
                    {errors.cnpj && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.cnpj}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) =>
                      handleChange("cnpj", e.target.value, maskCNPJ)
                    }
                    className={`w-full flex h-10 rounded-md border ${errors.cnpj ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Endereço */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-foreground border-t pt-8">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-medium">Endereço</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Linha 1 do Endereço */}
                <div className="space-y-1.5 md:col-span-4">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    País
                  </label>
                  <select
                    value={formData.pais}
                    onChange={(e) => handleChange("pais", e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {PAISES.map((p) => (
                      <option key={p.code} value={p.nome}>
                        {p.flag} {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-4">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between items-center gap-2">
                    <span>CEP / Zip Code</span>
                    <span className="flex items-center gap-1.5">
                      {isCepLoading && formData.pais === "Brasil" && (
                        <Loader2
                          className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0"
                          aria-hidden
                        />
                      )}
                      {errors.cep && (
                        <span className="text-red-500 font-bold normal-case text-[10px]">
                          {errors.cep}
                        </span>
                      )}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) =>
                      handleChange(
                        "cep",
                        e.target.value,
                        formData.pais === "Brasil" ? maskCEP : undefined,
                      )
                    }
                    className={`w-full flex h-10 rounded-md border ${errors.cep ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                    placeholder={
                      formData.pais === "Brasil" ? "00000-000" : "Código Postal"
                    }
                  />
                </div>
                <div className="space-y-1.5 md:col-span-4">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Estado / Província</span>
                    {errors.estado && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.estado}
                      </span>
                    )}
                  </label>
                  {formData.pais === "Brasil" ? (
                    <select
                      value={formData.estado}
                      onChange={(e) => handleChange("estado", e.target.value)}
                      className={`w-full flex h-10 rounded-md border ${errors.estado ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer`}
                    >
                      <option value="" disabled>
                        Selecione um UF
                      </option>
                      {UFs.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => handleChange("estado", e.target.value)}
                      className={`w-full flex h-10 rounded-md border ${errors.estado ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent`}
                      placeholder="Estado/Província"
                    />
                  )}
                </div>

                {/* Linha 2 do Endereço */}
                <div className="space-y-1.5 md:col-span-9">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Cidade</span>
                    {errors.cidade && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.cidade}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    className={`w-full flex h-10 rounded-md border ${errors.cidade ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent`}
                    placeholder="Nome da Cidade"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Bairro</span>
                    {errors.bairro && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.bairro}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => handleChange("bairro", e.target.value)}
                    className={`w-full flex h-10 rounded-md border ${errors.bairro ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent`}
                    placeholder="Bairro ou Distrito"
                  />
                </div>

                {/* Linha 3 do Endereço */}
                <div className="space-y-1.5 md:col-span-6">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Logradouro</span>
                    {errors.logradouro && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.logradouro}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.logradouro}
                    onChange={(e) => handleChange("logradouro", e.target.value)}
                    className={`w-full flex h-10 rounded-md border ${errors.logradouro ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent`}
                    placeholder="Rua, Avenida, Rodovia..."
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Número</span>
                    {errors.numero && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.numero}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) =>
                      handleChange(
                        "numero",
                        e.target.value,
                        formData.pais === "Brasil" ? maskNumero : undefined,
                      )
                    }
                    className={`w-full flex h-10 rounded-md border ${errors.numero ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-4">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.complemento}
                    onChange={(e) =>
                      handleChange("complemento", e.target.value)
                    }
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Armazém, Sala, Andar..."
                  />
                </div>
              </div>
            </div>

            {/* Section 3: SAC */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-foreground border-t pt-8">
                <Phone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-medium">
                  Serviço de Atendimento (SAC)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>E-mail</span>
                    {errors.email && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.email}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-3 h-4 w-4 ${errors.email ? "text-red-400" : "text-muted-foreground"}`}
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value.toLowerCase())
                      }
                      className={`w-full flex h-10 rounded-md border ${errors.email ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                      placeholder="sac@exemplo.com.br"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Tel: Capitais e Grandes Cidades</span>
                    {errors.telCapitais && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.telCapitais}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.telCapitais}
                    onChange={(e) =>
                      handleChange(
                        "telCapitais",
                        e.target.value,
                        formData.pais === "Brasil" ? maskTelefone : undefined,
                      )
                    }
                    className={`w-full flex h-10 rounded-md border ${errors.telCapitais ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                    placeholder="(00) 4004-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                    <span>Tel: Demais Regiões</span>
                    {errors.telDemais && (
                      <span className="text-red-500 font-bold normal-case text-[10px]">
                        {errors.telDemais}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.telDemais}
                    onChange={(e) =>
                      handleChange(
                        "telDemais",
                        e.target.value,
                        formData.pais === "Brasil" ? maskTelefone : undefined,
                      )
                    }
                    className={`w-full flex h-10 rounded-md border ${errors.telDemais ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-input bg-background focus:ring-primary"} px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent font-mono`}
                    placeholder="0800 000 0000"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 flex gap-3 justify-end items-center">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                variant="outline"
                className="border-input bg-background text-foreground hover:bg-muted/60"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave()}
                className="auth-cta-glow bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingId ? "Salvar alterações" : "Salvar Importador"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col pt-6 pb-12 px-4 sm:px-8 overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
              Gestão de <span className="font-semibold">Importadores</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Cadastre e gerencie os importadores que aparecerão nas suas
              labels.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="auth-cta-glow cursor-pointer whitespace-nowrap bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Ship className="w-4 h-4 mr-2" />
            Novo Importador
          </Button>
        </div>

        <div className="auth-frost-panel overflow-hidden rounded-xl">
          <div className="border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-6">
            <label htmlFor="importer-list-search" className="sr-only">
              Buscar importadores
            </label>
            <div className="relative max-w-md">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="importer-list-search"
                type="search"
                value={listSearchQuery}
                onChange={(e) => setListSearchQuery(e.target.value)}
                placeholder="Buscar por nome, CNPJ ou localidade…"
                autoComplete="off"
                className="h-9 bg-background/50 pl-9 dark:bg-input/20"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/60 border-b border-border uppercase text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Razão Social</th>
                  <th className="px-6 py-4">CNPJ</th>
                  <th className="px-6 py-4">Localidade</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoadingList ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      <Loader2
                        className="w-6 h-6 animate-spin inline-block text-muted-foreground"
                        aria-hidden
                      />
                      <span className="sr-only">Carregando importadores…</span>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredImporters.map((importer) => (
                      <tr
                        key={importer.id}
                        className="hover:bg-muted/60 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px] md:max-w-xs block">
                            {importer.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">{importer.cnpj}</td>
                        <td className="px-6 py-4">
                          {importer.city} / {importer.state}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              disabled={loadingEditId !== null}
                              onClick={() => void openEditImporter(importer.id)}
                              title="Editar importador"
                              aria-label="Editar importador"
                              className="shrink-0 border-primary/30 bg-background/60 text-primary shadow-sm backdrop-blur-sm hover:border-primary/50 hover:bg-primary/12 hover:text-primary dark:border-primary/40 dark:bg-background/30 dark:hover:bg-primary/18"
                            >
                              {loadingEditId === importer.id ? (
                                <>
                                  <Loader2
                                    className="animate-spin"
                                    aria-hidden
                                  />
                                  <span className="sr-only">Carregando…</span>
                                </>
                              ) : (
                                <Pencil className="size-3.5" aria-hidden />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              disabled={loadingEditId !== null}
                              onClick={() =>
                                handleDeleteImporter(importer.id, importer.name)
                              }
                              title="Excluir importador"
                              aria-label="Excluir importador"
                              className="shrink-0 border border-destructive/25 bg-destructive/10 shadow-sm backdrop-blur-sm hover:bg-destructive/20 dark:border-destructive/35"
                            >
                              <Trash2 className="size-3.5" aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {importers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          Nenhum importador cadastrado.
                        </td>
                      </tr>
                    )}
                    {importers.length > 0 && filteredImporters.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          Nenhum importador corresponde à busca.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteImporter}
          title="Excluir Importador"
          description={`Você tem certeza que deseja excluir o importador "${importerToDelete?.name}"? Esta ação removerá permanentemente os dados de faturamento.`}
        />
      </div>
    </div>
  );
}

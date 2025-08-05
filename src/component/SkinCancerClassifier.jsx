import React, { useState, useRef } from 'react';
import { Upload, Camera, BarChart3, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const SkinCancerClassifier = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Mapeo actualizado basado en el config.json del modelo
    const cancerTypes = {
        'actinic keratoses': {
            name: 'Queratosis Actínica',
            severity: 'media',
            color: '#ca8a04',
            description: 'Lesión precancerosa causada por daño solar'
        },
        'basal cell carcinoma': {
            name: 'Carcinoma Basocelular',
            severity: 'alta',
            color: '#ea580c',
            description: 'Tipo más común de cáncer de piel'
        },
        'benign keratosis-like-lesions': {
            name: 'Lesiones Benignas Tipo Queratosis',
            severity: 'baja',
            color: '#16a34a',
            description: 'Lesiones benignas que parecen queratosis'
        },
        'chickenpox': {
            name: 'Varicela',
            severity: 'baja',
            color: '#7c3aed',
            description: 'Infección viral común en niños'
        },
        'cowpox': {
            name: 'Viruela Bovina',
            severity: 'baja',
            color: '#7c3aed',
            description: 'Infección viral zoonótica'
        },
        'dermatofibroma': {
            name: 'Dermatofibroma',
            severity: 'baja',
            color: '#059669',
            description: 'Tumor benigno de la piel'
        },
        'healthy': {
            name: 'Piel Saludable',
            severity: 'baja',
            color: '#16a34a',
            description: 'Piel sin lesiones aparentes'
        },
        'hfmd': {
            name: 'Enfermedad de Manos, Pies y Boca',
            severity: 'baja',
            color: '#7c3aed',
            description: 'Infección viral común en niños'
        },
        'measles': {
            name: 'Sarampión',
            severity: 'media',
            color: '#d97706',
            description: 'Infección viral altamente contagiosa'
        },
        'melanocytic nevi': {
            name: 'Nevus Melanocítico (Lunares)',
            severity: 'baja',
            color: '#16a34a',
            description: 'Lunares benignos comunes'
        },
        'melanoma': {
            name: 'Melanoma',
            severity: 'alta',
            color: '#dc2626',
            description: 'Forma más peligrosa de cáncer de piel'
        },
        'monkeypox': {
            name: 'Viruela del Mono',
            severity: 'media',
            color: '#d97706',
            description: 'Infección viral zoonótica'
        },
        'squamous cell carcinoma': {
            name: 'Carcinoma Escamocelular',
            severity: 'alta',
            color: '#ea580c',
            description: 'Segundo tipo más común de cáncer de piel'
        },
        'vascular lesions': {
            name: 'Lesiones Vasculares',
            severity: 'baja',
            color: '#7c3aed',
            description: 'Lesiones relacionadas con vasos sanguíneos'
        }
    };

    // Estado para configuración del servidor
    const [serverConfig, setServerConfig] = useState({
        url: 'http://localhost:8080',
        timeout: 30000
    });

    // Función para convertir valores a porcentaje
    const toPercentage = (value) => {
        const numericValue = Number(value);
        return numericValue > 1 ? numericValue : numericValue * 100;
    };

    // Función para validar conexión con el servidor
    const checkServerConnection = async () => {
        try {
            const response = await fetch(`${serverConfig.url}/api/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            console.log('Servidor no disponible:', error.message);
            return false;
        }
    };

    // Función para reset del formulario
    const resetForm = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setPrediction(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Función mejorada para manejar carga de imágenes
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            setError('Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, BMP');
            return;
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('El archivo es demasiado grande. Máximo 10MB.');
            return;
        }

        setSelectedImage(file);
        setError(null);
        setPrediction(null);

        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.onerror = () => {
            setError('Error al leer el archivo de imagen');
        };
        reader.readAsDataURL(file);
    };

    // Simulación mejorada del modelo basada en las clases reales
    const simulateModelPrediction = () => {
        const classes = Object.keys(cancerTypes);
        const probabilities = {};

        // Generar probabilidades más realistas
        let remaining = 1.0;

        // Dar mayor probabilidad a algunas clases más comunes
        const commonClasses = ['melanocytic nevi', 'healthy', 'benign keratosis-like-lesions'];
        const rareClasses = ['melanoma', 'squamous cell carcinoma', 'basal cell carcinoma'];

        for (let i = 0; i < classes.length - 1; i++) {
            const className = classes[i];
            let baseProb;

            if (commonClasses.includes(className)) {
                baseProb = Math.random() * 0.4; // Hasta 40%
            } else if (rareClasses.includes(className)) {
                baseProb = Math.random() * 0.15; // Hasta 15%
            } else {
                baseProb = Math.random() * 0.2; // Hasta 20%
            }

            const prob = Math.min(baseProb, remaining * 0.9);
            probabilities[className] = prob;
            remaining -= prob;
        }
        probabilities[classes[classes.length - 1]] = Math.max(0, remaining);

        // Encontrar la clase con mayor probabilidad
        const sortedResults = Object.entries(probabilities)
            .sort(([, a], [, b]) => b - a)
            .map(([className, prob]) => ({
                className,
                probability: prob,
                confidence: prob,
                ...cancerTypes[className]
            }));

        return {
            predictedClass: sortedResults[0].className,
            confidence: sortedResults[0].confidence,
            allProbabilities: sortedResults
        };
    };

    const handlePredict = async () => {
        if (!selectedImage) {
            setError('Por favor selecciona una imagen primero');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Crear FormData con la imagen
            const formData = new FormData();
            formData.append('image', selectedImage);

            // Llamada real al backend
            const response = await fetch(`${serverConfig.url}/api/predict`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(serverConfig.timeout)
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('Resultado del servidor:', result);

            if (result.success) {
                // Validar la suma de probabilidades
                const probSum = result.allProbabilities.reduce((sum, item) => sum + item.probability, 0);
                if (Math.abs(1 - probSum) > 0.01) { // Tolerancia de 1%
                    console.warn('Advertencia: Las probabilidades no suman 1.0, suma actual:', probSum);
                    setError('⚠️ Las probabilidades del modelo no están normalizadas correctamente (suma: ' + probSum.toFixed(3) + ')');
                }

                // Mapear las clases del modelo a nuestras categorías
                const mappedResult = {
                    predictedClass: result.predictedClass,
                    confidence: result.confidence,
                    allProbabilities: result.allProbabilities.map(item => ({
                        ...item,
                        ...cancerTypes[item.className.toLowerCase()] || {
                            name: item.className,
                            severity: 'baja',
                            color: '#6b7280',
                            description: 'Clasificación sin descripción disponible'
                        }
                    }))
                };
                setPrediction(mappedResult);
            } else {
                setError(result.error || 'Error desconocido en la predicción');
            }
        } catch (err) {
            console.error('Error en predicción:', err);

            // Verificar si es un error de timeout
            if (err.name === 'AbortError') {
                setError('Tiempo de espera agotado. El servidor puede estar sobrecargado.');
            } else {
                setError('Error de conexión con el servidor: ' + err.message);
            }

            // Fallback a simulación si el servidor no está disponible
            console.log('Usando simulación como fallback...');
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simular procesamiento
                const result = simulateModelPrediction();
                setPrediction(result);
                setError('⚠️ Usando modo simulación (servidor no disponible)');
            } catch (simErr) {
                setError('Error en simulación: ' + simErr.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'alta':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'media':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'baja':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            'alta': 'bg-red-100 text-red-800 border-red-200',
            'media': 'bg-orange-100 text-orange-800 border-orange-200',
            'baja': 'bg-green-100 text-green-800 border-green-200'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[severity] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {severity === 'alta' ? 'Alto Riesgo' : severity === 'media' ? 'Riesgo Medio' : 'Bajo Riesgo'}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Clasificador de Lesiones Cutáneas con IA
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Análisis automático de imágenes dermatológicas usando Vision Transformer (ViT).
                    Identifica 14 tipos diferentes de condiciones cutáneas.
                </p>
            </div>

            {/* Configuración del servidor */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Configuración del Servidor</h3>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={serverConfig.url}
                        onChange={(e) => setServerConfig({ ...serverConfig, url: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="URL del servidor (ej: http://localhost:8080)"
                    />
                    <button
                        onClick={async () => {
                            const isConnected = await checkServerConnection();
                            alert(isConnected ? '✅ Servidor conectado correctamente' : '❌ Servidor no disponible');
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                        Probar Conexión
                    </button>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex flex-col items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    {!imagePreview ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all w-full max-w-md"
                        >
                            <div className="text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2 font-medium">Seleccionar imagen para análisis</p>
                                <p className="text-sm text-gray-400">PNG, JPG, JPEG, GIF, BMP (máx. 10MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Imagen para análisis"
                                    className="max-w-md max-h-64 rounded-lg shadow-md mb-4 mx-auto object-cover border"
                                />
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Cambiar imagen
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Limpiar todo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Predict Button */}
            <div className="text-center mb-6">
                <button
                    onClick={handlePredict}
                    disabled={!selectedImage || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                >
                    <Camera className="w-5 h-5" />
                    {isLoading ? 'Analizando imagen...' : 'Iniciar Análisis'}
                </button>
                {isLoading && (
                    <div className="mt-3">
                        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Procesando con modelo ViT...</p>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className={`border px-4 py-3 rounded-lg mb-6 ${error.includes('simulación')
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Results */}
            {prediction && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Resultados del Análisis</h2>
                    </div>

                    {/* Main Prediction */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-lg font-semibold text-gray-800">Predicción Principal:</span>
                            <div className="flex items-center gap-2">
                                {getSeverityIcon(prediction.allProbabilities[0].severity)}
                                {getSeverityBadge(prediction.allProbabilities[0].severity)}
                            </div>
                        </div>
                        <div className="mb-3">
                            <p className="text-2xl font-bold text-blue-600 mb-1">
                                {prediction.allProbabilities[0].name}
                            </p>
                            <p className="text-gray-600 text-sm">
                                {prediction.allProbabilities[0].description}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="font-medium">Confianza:</span>
                                <span className="text-blue-600 font-bold">
                                    {toPercentage(prediction.confidence).toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-gray-500">
                                Clase técnica: {prediction.predictedClass}
                            </div>
                        </div>
                    </div>

                    {/* All Probabilities */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Distribución de Probabilidades:
                        </h3>
                        <div className="space-y-3">
                            {prediction.allProbabilities.slice(0, 8).map((result, index) => (
                                <div key={result.className || index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {getSeverityIcon(result.severity)}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-800">
                                                        {result.name}
                                                    </span>
                                                    {getSeverityBadge(result.severity)}
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-gray-500">{result.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-600 ml-4">
                                            {toPercentage(result.confidence).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-700 ease-out"
                                            style={{
                                                width: `${toPercentage(result.confidence)}%`,
                                                backgroundColor: result.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {prediction.allProbabilities.length > 8 && (
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-500">
                                    Mostrando las 8 probabilidades más altas de {prediction.allProbabilities.length} clases totales
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Model Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">Información del Modelo:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-blue-700">Arquitectura:</span>
                                <span className="ml-2 font-medium">Vision Transformer (ViT)</span>
                            </div>
                            <div>
                                <span className="text-blue-700">Clases totales:</span>
                                <span className="ml-2 font-medium">{Object.keys(cancerTypes).length}</span>
                            </div>
                            <div>
                                <span className="text-blue-700">Resolución:</span>
                                <span className="ml-2 font-medium">224x224 px</span>
                            </div>
                        </div>
                    </div>

                    {/* Important Disclaimer */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-yellow-800 font-semibold mb-2">
                                    Aviso Médico Importante
                                </p>
                                <p className="text-sm text-yellow-700 leading-relaxed">
                                    Este sistema de IA es únicamente una herramienta de apoyo educativo y de investigación.
                                    <strong> NO sustituye el criterio médico profesional</strong>. Cualquier lesión cutánea
                                    sospechosa debe ser evaluada por un dermatólogo certificado. En caso de cambios en
                                    lunares o lesiones, consulte inmediatamente con un especialista.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
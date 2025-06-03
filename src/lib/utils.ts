import { clsx, type ClassValue } from "clsx"
import { format, formatDistanceToNow, isWithinInterval, subDays } from "date-fns"
import { twMerge } from "tailwind-merge"
import Hashids from 'hashids';
import { DEFAULT_SALT } from "@/lib/constants";
import { AxiosError } from "axios";
import { useToast } from "@/registry/new-york/hooks/use-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export const truncateText = (text: string | null | undefined, maxLength = 100): string => {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
};


export const formatCurrency = (value: number, useShortForm: boolean = false) => {
  const options: Intl.NumberFormatOptions = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  if (useShortForm) {
    if (Math.abs(value) >= 1000000000) {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 1;
      return (value / 1000000000).toLocaleString('en-US', options) + 'B';
    } else if (Math.abs(value) >= 1000000) {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 1;
      return (value / 1000000).toLocaleString('en-US', options) + 'M';
    } else if (Math.abs(value) >= 1000) {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 1;
      return (value / 1000).toLocaleString('en-US', options) + 'K';
    } else if (Math.abs(value) >= 1) {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    } else {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 6;
    }
  } else {
    if (Math.abs(value) >= 10000) {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    } else if (Math.abs(value) >= 1) {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    } else if (Math.abs(value) >= 0.0001) {
      options.minimumFractionDigits = 6;
      options.maximumFractionDigits = 6;
    } else {
      options.minimumFractionDigits = 9;
      options.maximumFractionDigits = 9;
    }
  }

  return value.toLocaleString('en-US', options);
};

const SUBSCRIPT_NUMBERS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

export function formatNumberWithSubscript(num: number): string {
  if (num === null || num === undefined) return '0'
  
  const [whole, decimals = ''] = num.toString().split('.')
  
  if (!decimals) {
    return Number(num).toFixed(2)
  }
  
  const normalDecimals = decimals.slice(0, 2)
  
  let position = ''
  for (let i = 2; i < decimals.length; i++) {
    if (decimals[i] !== '0') {
      position = i.toString()
      break
    }
  }
  
  const nextDigits = decimals.slice(2).replace(/^0+/, '').slice(0, 2)
  
  if (nextDigits && position) {
    return `${whole}.${normalDecimals}${SUBSCRIPT_NUMBERS[parseInt(position)]}${nextDigits[0]}`
  }
  
  return `${whole}.${normalDecimals}`
}

export const handleError = (error: any) => {
  const { toast } = useToast()
  console.error('Error:', error);
  
  let errorResponse = {
    status: 500,
    data: null,
    message: 'An unexpected error occurred'
  };
  
  if (error instanceof AxiosError) {
    if (error.response) {
      // Server responded with error status
      errorResponse = {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || error.message
      };
    } else if (error.request) {
      // Request was made but no response received
      errorResponse = {
        status: 0,
        data: null,
        message: 'No response received from server'
      };
    } else {
      // Error in setting up the request
      errorResponse = {
        status: 0,
        data: null,
        message: error.message || 'Error setting up the request'
      };
    }
  } else {
    // Handle non-Axios errors
    errorResponse = {
      status: 500,
      data: null,
      message: error?.message || 'An unexpected error occurred'
    };
  }

  // Show error message in toast
  toast({
    variant: "destructive",
    title: "Error",
    description: errorResponse.message
  });

  return errorResponse;
};
export const formatNumber = {
  currency: (value: number, useShortForm: boolean = false) => {
    return formatCurrency(value, useShortForm)
  },
  withSubscript: (num: number) => {
    return formatNumberWithSubscript(num)
  },
  formatWithSubscript: (num: number) => {
    if (num === null || num === undefined) return '0'
    
    const [whole, decimals = ''] = num.toString().split('.')
    
    if (!decimals) {
      return formatCurrency(num, true)
    }

    let zeroCount = 0
    let firstNonZeroIndex = -1
    
    for (let i = 0; i < decimals.length; i++) {
      if (decimals[i] === '0') {
        zeroCount++
      } else {
        firstNonZeroIndex = i
        break
      }
    }

    if (zeroCount >= 3) {
      const significantDigits = decimals.slice(firstNonZeroIndex, firstNonZeroIndex + 2)
      return `${whole}.0${SUBSCRIPT_NUMBERS[zeroCount]}${significantDigits}`
    }

    return formatCurrency(num, true)
  }
}

export const formatDateVariants = {
  short: (date: string | number | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit"
    });
  },
  medium: (date: string | number | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  },
  dateOnly: (date: string | number | Date) => {
    return format(new Date(date), 'yyyy-MM-dd');
  },
  long: (date: string | number | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  },
  iso: (date: string | number | Date) => {
    return new Date(date).toISOString();
  },
  time: (date: string | number | Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  },
  dateTime: (date: string | number | Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  },
  dateAgo: (date: string | number | Date) => {
    const dateObj = new Date(date)
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)
  
    if (isWithinInterval(dateObj, { start: thirtyDaysAgo, end: now })) {
      return formatDistanceToNow(dateObj, { addSuffix: true })
    }
    return dateObj.toLocaleDateString("en-US", {
      year: 'numeric',
    month: 'short',
    day: 'numeric'
    });
  },
  dateAgoShort: (date: string | number | Date) => {
    const dateObj = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffSec < 60) {
      return `${diffSec}s`
    } else if (diffMin < 60) {
      const sec = diffSec % 60
      return `${diffMin}min ${sec}s`
    } else if (diffHr < 24) {
      const min = diffMin % 60
      return `${diffHr}h ${min}min`
    } else if (diffDay < 7) {
      return `${diffDay}d ${diffHr % 24}h`
    } else {
      return dateObj.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
};

export const randomId = () => {
  return Math.random().toString(36).substring(2, 15);
}

interface ConvertToImageOptions {
  elementId: string;
  scale?: number;
  fileName?: string;
  fileType?: string;
  quality?: number;
}

export function convertElementToImage({
  elementId,
  scale = 2,
  fileName = `${Date.now()}.png`,
  fileType = 'image/png',
  quality = 0.95
}: ConvertToImageOptions): Promise<File> {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId)
    if (!element) {
      reject(new Error(`Element with id '${elementId}' not found`))
      return
    }

    import('html2canvas')
      .then(({ default: html2canvas }) => {
        html2canvas(element, {
          scale,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          imageTimeout: 0,
        })
          .then((canvas) => {
            const imageData = canvas.toDataURL(fileType, quality)
            return fetch(imageData)
              .then((res) => res.blob())
              .then((blob) => new File([blob], fileName, { type: fileType }))
          })
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
  })
}

export const generateHashId = () => {
  const hashids = new Hashids(DEFAULT_SALT, 7);
  const randomInteger = Math.floor(Math.random() * 1000000);
  const hashid = hashids.encode(randomInteger);
  return hashid
}

export * from './utils'

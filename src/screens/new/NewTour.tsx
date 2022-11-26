import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import storage from '~/api/firebase';
import locationApi from '~/api/location.api';
import tourApi from '~/api/tour.api';
import Dropdown from '~/components/dropdown/Dropdown';
import Field from '~/components/field/Field';
import Label from '~/components/label/Label';
import classNames from '~/utils/classNames';

const NewTour = () => {
    const { handleSubmit, control, setValue } = useForm();
    const [images, setImages] = useState<Array<string>>([]);
    const [percent, setPercent] = useState(0);
    const [urls, setUrls] = useState<Array<string>>([]);
    const [disable, setDisable] = useState<boolean>(true);
    const [beginning, setBeginning] = useState<string | any>([]);
    const [destination, setDestination] = useState<string | any>([]);

    const handleChange = (e: any) => {
        for (let i = 0; i < e.target.files.length; i++) {
            const newImage = e.target.files[i];
            newImage['id'] = Math.random();
            setImages((images) => [...images, newImage]);
        }
    };
    const uploadFireBase = () => {
        const promises: Array<any> = [];
        // eslint-disable-next-line array-callback-return
        images.map((image: any) => {
            const imageRef = ref(storage, `images/${image.name}`);
            const uploadTask = uploadBytesResumable(imageRef, image);
            promises.push(uploadTask);
            uploadTask.on(
                'state_changed',
                (snaphot: any) => {
                    const percent = 0;
                    setPercent(percent);
                },
                (err: any) => console.log(err),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((url: string) => {
                        setUrls((prev) => [...prev, url]);
                    });
                },
            );
        });
        Promise.all(promises)
            .then(() => {
                toast.success('Upload success', {
                    autoClose: 500,
                });
            })
            .catch((err) => console.log(err));
    };
    const onSubmit = ({ beginningLocation, destinationLocation, type, ...values }: any) => {
        const tour = {
            tourDetail: {
                ...values,
                beginningLocation: {
                    locationName: beginningLocation,
                    locationType: 'BEGINNING',
                },
                destinationLocation: {
                    locationName: destinationLocation,
                    locationType: 'DESTINATION',
                },
                images: urls,
            },
            type,
        };
        console.log('TCL: NewTour -> tour', tour);
        tourApi
            .saveTour(tour)
            .then((response) => {
                console.log(response);
            })
            .catch((errr) => console.log(errr));
    };
    type Location = {
        id: string;
        locationName: string;
        locationType: string;
    };
    useEffect(() => {
        const getData = async () => {
            await locationApi.getLocationByType('BEGINNING').then((reponse) => {
                reponse.data.map((item: Location) => {
                    setBeginning((prev: any) => [...prev, item.locationName]);
                });
            });
            await locationApi.getLocationByType('DESTINATION').then((reponse) => {
                reponse.data.map((item: Location) => {
                    setDestination((prev: any) => [...prev, item.locationName]);
                });
            });
        };
        getData();
    }, []);

    return (
        <div className='w-[800px]'>
            <div className='bg-white mt-10 rounded-md px-10 pt-10 pb-5'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <h1 className='font-bold text-lg'>Tour Infomation</h1>
                    <div className='text-right mt-10'>
                        <div className='grid grid-cols-2 gap-10'>
                            <Field
                                control={control}
                                name='tourName'
                                id='tour-name'
                                placeholder='Enter tour name...'
                            >
                                Tour Name
                            </Field>
                            <Field
                                control={control}
                                name='tourDes'
                                id='tour-des'
                                placeholder='Enter destination...'
                            >
                                Tour Description
                            </Field>
                        </div>
                        <div className='grid grid-cols-2 gap-10 mt-10'>
                            <div className='grid grid-cols-2 gap-2'>
                                <Field
                                    control={control}
                                    name='startDay'
                                    id='start-date'
                                    placeholder='dd/mm/yyyy'
                                >
                                    Start Day
                                </Field>
                                <Field
                                    control={control}
                                    name='endDay'
                                    id='end-Date'
                                    placeholder='dd/mm/yyyy'
                                >
                                    End Day
                                </Field>
                            </div>
                            <Field control={control} name='price' id='price' placeholder='2200000'>
                                Price
                            </Field>
                        </div>
                        <div className='grid grid-cols-3 gap-10 mt-10'>
                            <div className='flex flex-col gap-2 text-left'>
                                <Label htmlFor='' className=''>
                                    Beginning Location
                                </Label>
                                <Dropdown
                                    className=''
                                    control={control}
                                    setValue={setValue}
                                    dropdownLabel='Select location'
                                    name='beginningLocation'
                                    list={beginning}
                                />
                            </div>
                            <div className='flex flex-col gap-2 text-left'>
                                <Label htmlFor='' className=''>
                                    Destination Location
                                </Label>
                                <Dropdown
                                    className=''
                                    control={control}
                                    setValue={setValue}
                                    dropdownLabel='Select location'
                                    name='destinationLocation'
                                    list={destination}
                                />
                            </div>
                            <div className='flex flex-col gap-2 text-left'>
                                <Label htmlFor='' className=''>
                                    Tour Type
                                </Label>
                                <Dropdown
                                    className=''
                                    control={control}
                                    setValue={setValue}
                                    dropdownLabel='Select type'
                                    name='type'
                                    list={['TOUR_BASIC', 'HOTEL', 'FLIGHT']}
                                />
                            </div>
                        </div>
                        <div className='mt-10 text-left flex items-center'>
                            <input
                                type='file'
                                multiple
                                onChange={handleChange}
                                className='w-2/4 px-4 py-2 rounded-lg border border-c6'
                            />
                            <button
                                type='button'
                                onClick={uploadFireBase}
                                className={classNames(
                                    'ml-4 h-12 w-[130px] rounded-md text-white font-semibold',
                                    disable
                                        ? 'bg-gradient-to-br from-orange-500 to-pink-500'
                                        : 'bg-gradient-to-br from-orange-200 to-pink-200 cursor-no-drop',
                                )}
                            >
                                {disable ? (
                                    'Upload'
                                ) : (
                                    <div className='flex items-center justify-center'>
                                        <div className='w-7 h-7 bg-transparent border-[3px] border-t-[3px] border-t-transparent animate-spin border-white rounded-full'></div>
                                    </div>
                                )}
                            </button>
                        </div>
                        <button
                            type='submit'
                            className='mt-10 font-semibold text-white bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-4 py-2 rounded-md inline-block transition-all'
                        >
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTour;
